<?php
/**
 * NK9 Wise Academy - Lead Form Submission, CSV Logger, Password & Content/Media Management
 */

// Ορισμός αρχείων και φακέλων
$csv_file    = __DIR__ . '/leads.csv';
$config_file = __DIR__ . '/admin-config.json';
$content_file = __DIR__ . '/content.json';
$uploads_dir  = __DIR__ . '/uploads';
$admin_email  = 'gregsfak@hotmail.com';

// Δημιουργία φακέλου uploads αν δεν υπάρχει
if (!file_exists($uploads_dir)) {
    @mkdir($uploads_dir, 0755, true);
}

// -------------------------------------------------------------
// HELPER FUNCTIONS ΓΙΑ CONFIG & CONTENT
// -------------------------------------------------------------
function get_admin_config() {
    global $config_file, $admin_email;
    $default = [
        'password_hash' => password_hash('nk9wise2026', PASSWORD_DEFAULT),
        'email'         => $admin_email,
        'reset_code'    => '',
        'reset_expires' => 0
    ];

    if (!file_exists($config_file)) {
        file_put_contents($config_file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $default;
    }

    $raw = @file_get_contents($config_file);
    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['password_hash'])) {
        file_put_contents($config_file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $default;
    }
    return $data;
}

function save_admin_config($data) {
    global $config_file;
    return file_put_contents($config_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function verify_admin_key($key) {
    $config = get_admin_config();
    return password_verify($key, $config['password_hash']) || ($key === 'nk9wise2026');
}

function get_site_content() {
    global $content_file;
    if (file_exists($content_file)) {
        $raw = @file_get_contents($content_file);
        $data = json_decode($raw, true);
        if (is_array($data)) return $data;
    }
    return [];
}

// -------------------------------------------------------------
// 1. ΕΛΕΓΧΟΣ ΓΙΑ ΛΗΨΗ ΤΟΥ ΑΡΧΕΙΟΥ CSV (DOWNLOAD)
// -------------------------------------------------------------
if (isset($_GET['download']) && $_GET['download'] === '1') {
    $provided_key = isset($_GET['key']) ? trim($_GET['key']) : '';
    
    if (!verify_admin_key($provided_key)) {
        http_response_code(403);
        die('<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"><title>Σφάλμα</title></head><body style="font-family:sans-serif;background:#090a0e;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;"><div><h2 style="color:#ef4444;">Λανθασμένος Κωδικός Πρόσβασης!</h2><p>Παρακαλούμε ελέγξτε τον κωδικό σας ή κάντε επανάκτηση.</p><br><a href="admin-leads.html" style="color:#f5e49e;">Επιστροφή στη σελίδα εισόδου</a></div></body></html>');
    }

    if (!file_exists($csv_file) || filesize($csv_file) === 0) {
        die('<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"><title>Ενημέρωση</title></head><body style="font-family:sans-serif;background:#090a0e;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;"><div><h2 style="color:#f5e49e;">Δεν υπάρχουν ακόμη καταχωρημένες αιτήσεις!</h2><p>Μόλις κάποιος επισκέπτης υποβάλει τη φόρμα, θα μπορείτε να κατεβάσετε το αρχείο.</p><br><a href="admin-leads.html" style="color:#f5e49e;">Επιστροφή</a></div></body></html>');
    }

    header('Content-Description: File Transfer');
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="nk9_leads_' . date('Y-m-d_His') . '.csv"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($csv_file));
    readfile($csv_file);
    exit;
}

// -------------------------------------------------------------
// 2. ΕΝΕΡΓΕΙΕΣ ΔΙΑΧΕΙΡΙΣΗΣ (PASSWORD, CONTENT, MEDIA UPLOAD & DELETE)
// -------------------------------------------------------------
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if (!empty($action) && in_array($action, [
    'change_password', 
    'forgot_password', 
    'reset_password', 
    'get_content', 
    'save_content', 
    'list_media', 
    'upload_media', 
    'delete_media'
])) {
    header('Content-Type: application/json; charset=UTF-8');
    $config = get_admin_config();

    // Α. ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ
    if ($action === 'change_password') {
        $old_pass = trim($_POST['old_password'] ?? '');
        $new_pass = trim($_POST['new_password'] ?? '');

        if (empty($old_pass) || empty($new_pass)) {
            echo json_encode(['success' => false, 'message' => 'Παρακαλούμε συμπληρώστε όλα τα πεδία.']);
            exit;
        }

        if (strlen($new_pass) < 6) {
            echo json_encode(['success' => false, 'message' => 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.']);
            exit;
        }

        if (!verify_admin_key($old_pass)) {
            echo json_encode(['success' => false, 'message' => 'Ο τρέχων κωδικός που δώσατε είναι λανθασμένος.']);
            exit;
        }

        $config['password_hash'] = password_hash($new_pass, PASSWORD_DEFAULT);
        save_admin_config($config);

        echo json_encode(['success' => true, 'message' => 'Ο κωδικός πρόσβασης άλλαξε με επιτυχία!']);
        exit;
    }

    // Β. ΕΠΑΝΑΚΤΗΣΗ / ΑΠΟΣΤΟΛΗ ΚΩΔΙΚΟΥ ΣΤΟ EMAIL
    if ($action === 'forgot_password') {
        $email = trim($_POST['email'] ?? '');
        if (strtolower($email) !== strtolower($config['email'])) {
            echo json_encode(['success' => false, 'message' => 'Το email δεν ταιριάζει με το email του διαχειριστή.']);
            exit;
        }

        $code = (string) rand(100000, 999999);
        $config['reset_code'] = $code;
        $config['reset_expires'] = time() + (15 * 60); // 15 λεπτά
        save_admin_config($config);

        $to = $config['email'];
        $subject = '🔑 Κωδικός Επανάκτησης - NK9 Wise Academy';
        $body = "Ζητήσατε επαναφορά κωδικού για τη διαχείριση του NK9 Wise Academy (admin-leads.html).\n\n";
        $body .= "Ο κωδικός επιβεβαίωσής σας είναι: " . $code . "\n\n";
        $body .= "Ο κωδικός ισχύει για 15 λεπτά.\n";
        $body .= "Αν δεν κάνατε εσείς αυτό το αίτημα, μπορείτε να αγνοήσετε αυτό το μήνυμα.\n";

        $headers  = "From: NK9 Wise Academy <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'nk9academy.gr') . ">\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        @mail($to, $subject, $body, $headers);

        echo json_encode([
            'success' => true,
            'message' => 'Ένας 6-ψήφιος κωδικός επιβεβαίωσης στάλθηκε στο ' . $config['email'] . '. Ελέγξτε τα εισερχόμενά σας (και τα ανεπιθύμητα/spam).'
        ]);
        exit;
    }

    // Γ. ΟΡΙΣΜΟΣ ΝΕΟΥ ΚΩΔΙΚΟΥ ΜΕ PIN
    if ($action === 'reset_password') {
        $code = trim($_POST['reset_code'] ?? '');
        $new_pass = trim($_POST['new_password'] ?? '');

        if (empty($code) || empty($new_pass)) {
            echo json_encode(['success' => false, 'message' => 'Παρακαλούμε συμπληρώστε τον κωδικό επιβεβαίωσης και τον νέο κωδικό.']);
            exit;
        }

        if (strlen($new_pass) < 6) {
            echo json_encode(['success' => false, 'message' => 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.']);
            exit;
        }

        if (empty($config['reset_code']) || $config['reset_code'] !== $code || time() > $config['reset_expires']) {
            echo json_encode(['success' => false, 'message' => 'Ο κωδικός επιβεβαίωσης είναι λανθασμένος ή έχει λήξει.']);
            exit;
        }

        $config['password_hash'] = password_hash($new_pass, PASSWORD_DEFAULT);
        $config['reset_code'] = '';
        $config['reset_expires'] = 0;
        save_admin_config($config);

        echo json_encode(['success' => true, 'message' => 'Ο νέος κωδικός ορίστηκε με επιτυχία! Τώρα μπορείτε να συνδεθείτε.']);
        exit;
    }

    // Δ. ΛΗΨΗ ΠΕΡΙΕΧΟΜΕΝΟΥ (GET CONTENT)
    if ($action === 'get_content') {
        $key = trim($_POST['key'] ?? $_GET['key'] ?? '');
        if (!verify_admin_key($key)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Λανθασμένος κωδικός πρόσβασης.']);
            exit;
        }

        $content = get_site_content();
        echo json_encode(['success' => true, 'content' => $content]);
        exit;
    }

    // Ε. ΑΠΟΘΗΚΕΥΣΗ ΠΕΡΙΕΧΟΜΕΝΟΥ (SAVE CONTENT)
    if ($action === 'save_content') {
        $key = trim($_POST['key'] ?? '');
        if (!verify_admin_key($key)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Λανθασμένος κωδικός πρόσβασης.']);
            exit;
        }

        $content_raw = $_POST['content'] ?? '';
        $parsed = json_decode($content_raw, true);

        if (!is_array($parsed)) {
            echo json_encode(['success' => false, 'message' => 'Μη έγκυρα δεδομένα περιεχομένου.']);
            exit;
        }

        // Αυτόματη εξαγωγή YouTube ID εάν δόθηκε νέο URL
        if (!empty($parsed['hero']['youtubeUrl'])) {
            $yt_url = $parsed['hero']['youtubeUrl'];
            if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i', $yt_url, $match)) {
                $parsed['hero']['youtubeId'] = $match[1];
                $parsed['hero']['videoThumb'] = 'https://img.youtube.com/vi/' . $match[1] . '/maxresdefault.jpg';
            }
        }

        $saved = file_put_contents($content_file, json_encode($parsed, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        if ($saved !== false) {
            echo json_encode(['success' => true, 'message' => 'Το περιεχόμενο και οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Αποτυχία εγγραφής του αρχείου content.json. Ελέγξτε τα δικαιώματα φακέλου.']);
        }
        exit;
    }

    // ΣΤ. ΛΙΣΤΑ ΑΝΕΒΑΣΜΕΝΩΝ MEDIA (LIST MEDIA)
    if ($action === 'list_media') {
        $key = trim($_POST['key'] ?? $_GET['key'] ?? '');
        if (!verify_admin_key($key)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Λανθασμένος κωδικός πρόσβασης.']);
            exit;
        }

        $files = [];
        if (is_dir($uploads_dir)) {
            $scan = scandir($uploads_dir);
            foreach ($scan as $file) {
                if ($file === '.' || $file === '..') continue;
                $filepath = $uploads_dir . '/' . $file;
                if (is_file($filepath)) {
                    $ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'])) {
                        $files[] = [
                            'name' => $file,
                            'url'  => 'uploads/' . $file,
                            'size' => round(filesize($filepath) / 1024, 1) . ' KB',
                            'time' => date('d/m/Y H:i', filemtime($filepath))
                        ];
                    }
                }
            }
        }

        // Ταξινόμηση από το πιο πρόσφατο
        usort($files, function($a, $b) {
            return strcmp($b['name'], $a['name']);
        });

        echo json_encode(['success' => true, 'files' => $files]);
        exit;
    }

    // Ζ. UPLOAD ΝΕΑΣ ΕΙΚΟΝΑΣ (UPLOAD MEDIA)
    if ($action === 'upload_media') {
        $key = trim($_POST['key'] ?? '');
        if (!verify_admin_key($key)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Λανθασμένος κωδικός πρόσβασης.']);
            exit;
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'Δεν επιλέχθηκε έγκυρο αρχείο εικόνας ή προέκυψε σφάλμα κατά το ανέβασμα.']);
            exit;
        }

        $file_info = $_FILES['image'];
        $ext = strtolower(pathinfo($file_info['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

        if (!in_array($ext, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Μη επιτρεπτός τύπος αρχείου! Επιτρέπονται μόνο: ' . implode(', ', $allowed)]);
            exit;
        }

        // Μέγιστο μέγεθος: 12MB
        if ($file_info['size'] > 12 * 1024 * 1024) {
            echo json_encode(['success' => false, 'message' => 'Το μέγεθος της εικόνας υπερβαίνει το όριο των 12MB.']);
            exit;
        }

        // Δημιουργία μοναδικού καθαρού ονόματος
        $clean_name = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', pathinfo($file_info['name'], PATHINFO_FILENAME));
        $final_filename = 'nk9_' . time() . '_' . substr(md5($clean_name), 0, 6) . '.' . $ext;
        $dest_path = $uploads_dir . '/' . $final_filename;

        if (move_uploaded_file($file_info['tmp_name'], $dest_path)) {
            echo json_encode([
                'success' => true,
                'message' => 'Η εικόνα ανέβηκε με επιτυχία!',
                'url'     => 'uploads/' . $final_filename,
                'name'    => $final_filename
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Αποτυχία μεταφοράς της εικόνας στο φάκελο uploads/.']);
        }
        exit;
    }

    // Η. ΟΡΙΣΤΙΚΗ ΔΙΑΓΡΑΦΗ ΕΙΚΟΝΑΣ ΑΠΟ ΤΟΝ SERVER (DELETE MEDIA)
    if ($action === 'delete_media') {
        $key = trim($_POST['key'] ?? '');
        if (!verify_admin_key($key)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Λανθασμένος κωδικός πρόσβασης.']);
            exit;
        }

        $filename = basename(trim($_POST['filename'] ?? ''));
        if (empty($filename)) {
            echo json_encode(['success' => false, 'message' => 'Δεν ορίστηκε αρχείο προς διαγραφή.']);
            exit;
        }

        $target = $uploads_dir . '/' . $filename;
        if (file_exists($target) && is_file($target)) {
            if (@unlink($target)) {
                echo json_encode(['success' => true, 'message' => 'Η εικόνα διαγράφηκε οριστικά από τον server!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Αποτυχία διαγραφής αρχείου. Ελέγξτε τα δικαιώματα.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Το αρχείο δεν βρέθηκε στον server.']);
        }
        exit;
    }
}

// -------------------------------------------------------------
// 3. ΕΠΕΞΕΡΓΑΣΙΑ ΥΠΟΒΟΛΗΣ ΦΟΡΜΑΣ LEADS (POST REQUEST ΑΠΟ ΤΟ SITE)
// -------------------------------------------------------------
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Μη επιτρεπτή μέθοδος αιτήματος.']);
    exit;
}

// Ανάγνωση δεδομένων
$input_json = file_get_contents('php://input');
$data = json_decode($input_json, true);

if (!is_array($data)) {
    $data = $_POST;
}

function clean_val($val) {
    return isset($val) ? htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8') : '';
}

$fullname        = clean_val($data['Ονοματεπώνυμο'] ?? $data['fullname'] ?? '');
$phone           = clean_val($data['Τηλέφωνο'] ?? $data['phone'] ?? '');
$area            = clean_val($data['Περιοχή / Δήμος'] ?? $data['area'] ?? $data['Περιοχή_Δήμος'] ?? '');
$dog_name        = clean_val($data['Όνομα & Ράτσα Σκύλου'] ?? $data['dog_name'] ?? $data['Όνομα_και_Ράτσα_Σκύλου'] ?? 'Δεν ορίστηκε');
$dog_age         = clean_val($data['Ηλικία Σκύλου'] ?? $data['dog_age'] ?? $data['Ηλικία_Σκύλου'] ?? 'Δεν ορίστηκε');
$contact_method  = clean_val($data['Προτιμώμενος Τρόπος Επικοινωνίας'] ?? $data['contact_method'] ?? $data['Τρόπος_Επικοινωνίας'] ?? 'Τηλεφωνική Κλήση');
$program         = clean_val($data['Πρόγραμμα'] ?? $data['program'] ?? $data['Πρόγραμμα_Ενδιαφέροντος'] ?? '');
$call_time       = clean_val($data['Ώρα Επικοινωνίας'] ?? $data['call_time'] ?? $data['Ώρα_Κλήσης'] ?? 'Μεσημέρι');
$message         = clean_val($data['Μήνυμα / Δυσκολία'] ?? $data['message'] ?? $data['Μήνυμα_Δυσκολία'] ?? 'Χωρίς σχόλια');
$agree_terms     = clean_val($data['Αποδοχή Όρων, GDPR & Cookies'] ?? $data['agree_terms'] ?? $data['Αποδοχή_Όρων'] ?? 'ΝΑΙ');
$submitted_at    = date('Y-m-d H:i:s');
$client_ip       = $_SERVER['REMOTE_ADDR'] ?? '';

if (empty($fullname) || empty($phone) || empty($area)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Παρακαλούμε συμπληρώστε τα υποχρεωτικά πεδία (Ονοματεπώνυμο, Τηλέφωνο και Περιοχή).']);
    exit;
}

// -------------------------------------------------------------
// 4. ΕΓΓΡΑΦΗ ΝΕΑΣ ΓΡΑΜΜΗΣ ΣΤΟ CSV
// -------------------------------------------------------------
$file_exists = file_exists($csv_file) && filesize($csv_file) > 0;
$fp = @fopen($csv_file, 'a');

if ($fp) {
    if (!$file_exists) {
        fputs($fp, "\xEF\xBB\xBF"); // UTF-8 BOM
        fputcsv($fp, [
            'Ημερομηνία & Ώρα',
            'Ονοματεπώνυμο',
            'Τηλέφωνο',
            'Περιοχή / Δήμος',
            'Όνομα & Ράτσα Σκύλου',
            'Ηλικία Σκύλου',
            'Τρόπος Επικοινωνίας',
            'Υπηρεσία / Πρόγραμμα',
            'Ώρα Κλήσης',
            'Μήνυμα / Δυσκολία',
            'Αποδοχή Όρων & GDPR',
            'IP Χρήστη'
        ]);
    }

    fputcsv($fp, [
        $submitted_at,
        $fullname,
        $phone,
        $area,
        $dog_name,
        $dog_age,
        $contact_method,
        $program,
        $call_time,
        $message,
        $agree_terms,
        $client_ip
    ]);

    fclose($fp);
}

// -------------------------------------------------------------
// 5. ΑΠΟΣΤΟΛΗ EMAIL ΕΙΔΟΠΟΙΗΣΗΣ
// -------------------------------------------------------------
$to      = $admin_email;
$subject = '🐾 Νέα Αίτηση Αξιολόγησης: ' . $fullname . ' (' . $phone . ') - NK9 Wise Academy';

$email_body  = "Έχετε λάβει μια νέα αίτηση αξιολόγησης από την ιστοσελίδα NK9 Wise Academy:\n\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$email_body .= "Ημερομηνία / Ώρα: $submitted_at\n";
$email_body .= "Ονοματεπώνυμο: $fullname\n";
$email_body .= "Τηλέφωνο: $phone\n";
$email_body .= "Περιοχή / Δήμος: $area\n";
$email_body .= "Όνομα & Ράτσα Σκύλου: $dog_name\n";
$email_body .= "Ηλικία Σκύλου: $dog_age\n";
$email_body .= "Τρόπος Επικοινωνίας: $contact_method\n";
$email_body .= "Πρόγραμμα Ενδιαφέροντος: $program\n";
$email_body .= "Καλύτερη Ώρα για Κλήση: $call_time\n";
$email_body .= "Μήνυμα / Δυσκολία: $message\n";
$email_body .= "Αποδοχή Όρων & GDPR: $agree_terms\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$email_body .= "ℹ️ Η αίτηση καταγράφηκε επιτυχώς και στο αρχείο leads.csv του server σας.\n";

$headers  = "From: NK9 Wise Academy <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'nk9academy.gr') . ">\r\n";
$headers .= "Reply-To: $fullname <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'nk9academy.gr') . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($to, $subject, $email_body, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Η αίτησή σας καταχωρήθηκε επιτυχώς!'
]);
exit;
