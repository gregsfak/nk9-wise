<?php
/**
 * NK9 Wise Academy - Lead Form Submission & CSV Logger
 * 
 * Αυτό το αρχείο:
 * 1. Λαμβάνει τα στοιχεία της φόρμας από το HTML site.
 * 2. Αποθηκεύει αυτόματα κάθε νέα αίτηση ως γραμμή στο leads.csv (με UTF-8 BOM για τέλειο Excel).
 * 3. Στέλνει email ειδοποίησης στο gregsfak@hotmail.com.
 * 4. Επιτρέπει ασφαλή λήψη του CSV μόνο με μυστικό κλειδί (π.χ. submit-lead.php?download=1&key=nk9wise2026).
 */

// Ορισμός Headers για ασφάλεια και JSON απάντηση
header('Content-Type: application/json; charset=UTF-8');

// Μυστικό κλειδί για τη λήψη του αρχείου CSV (μπορείτε να το αλλάξετε)
define('SECRET_KEY', 'nk9wise2026');

// Διαδρομή αποθήκευσης του αρχείου CSV
$csv_file = __DIR__ . '/leads.csv';

// -------------------------------------------------------------
// 1. ΕΛΕΓΧΟΣ ΓΙΑ ΛΗΨΗ ΤΟΥ ΑΡΧΕΙΟΥ CSV (DOWNLOAD)
// -------------------------------------------------------------
if (isset($_GET['download']) && $_GET['download'] === '1') {
    $provided_key = isset($_GET['key']) ? trim($_GET['key']) : '';
    
    if ($provided_key !== SECRET_KEY) {
        http_response_code(403);
        die('Δεν έχετε δικαίωμα πρόσβασης. Λανθασμένο μυστικό κλειδί.');
    }

    if (!file_exists($csv_file) || filesize($csv_file) === 0) {
        die('Δεν υπάρχουν ακόμη καταχωρημένες αιτήσεις στο αρχείο.');
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
// 2. ΕΠΕΞΕΡΓΑΣΙΑ ΥΠΟΒΟΛΗΣ ΦΟΡΜΑΣ (POST REQUEST)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Μη επιτρεπτή μέθοδος αιτήματος.']);
    exit;
}

// Ανάγνωση δεδομένων είτε από JSON είτε από τυπικό $_POST
$input_json = file_get_contents('php://input');
$data = json_decode($input_json, true);

if (!is_array($data)) {
    $data = $_POST;
}

// Καθαρισμός και ανάκτηση πεδίων
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

// Υποχρεωτικά πεδία
if (empty($fullname) || empty($phone) || empty($area)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Παρακαλούμε συμπληρώστε τα υποχρεωτικά πεδία (Ονοματεπώνυμο, Τηλέφωνο και Περιοχή).']);
    exit;
}

// -------------------------------------------------------------
// 3. ΕΓΓΡΑΦΗ ΝΕΑΣ ΓΡΑΜΜΗΣ ΣΤΟ CSV
// -------------------------------------------------------------
$file_exists = file_exists($csv_file) && filesize($csv_file) > 0;
$fp = @fopen($csv_file, 'a');

if ($fp) {
    if (!$file_exists) {
        // UTF-8 BOM για αυτόματη αναγνώριση Ελληνικών στο Excel
        fputs($fp, "\xEF\xBB\xBF");
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

    // Προσθήκη νέας γραμμής
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
// 4. ΑΠΟΣΤΟΛΗ EMAIL ΕΙΔΟΠΟΙΗΣΗΣ ΣΤΟΝ ΕΚΠΑΙΔΕΥΤΗ
// -------------------------------------------------------------
$to      = 'gregsfak@hotmail.com';
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

// Επιστροφή JSON επιτυχίας στο JavaScript
echo json_encode([
    'success' => true,
    'message' => 'Η αίτησή σας καταχωρήθηκε επιτυχώς!'
]);
exit;
