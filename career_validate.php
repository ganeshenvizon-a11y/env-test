<?php
error_reporting(E_ALL & ~E_NOTICE);

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

// reCAPTCHA v2 keys
$siteKey = '6LfMv1YqAAAAAKtfU2OduJtKdwY5TrzHdZaYO1jw';
$secretKey = '6LfMv1YqAAAAAIkTBUjJGeD_aVZuR2d_d-wsIVAe';

// Outgoing mail configuration
$fromName = 'Envizon Studio';
$formEmail = 'Hello@envizonstudio.com';
$emailCc = 'digital@envizonstudio.com';
$emailBcc = 'web@envizonstudio.com';
$toEmail = 'Hello@envizonstudio.com';
$smtpHost = 'smtp.office365.com';
$smtpUsername = 'Hello@envizonstudio.com';
$smtpPassword = 'Envizon@980 ';
$smtpPort = 587;

// Resume upload constraints
$resumeAllowedExtensions = ['pdf', 'doc', 'docx'];
$resumeAllowedMimeTypes = [
    'pdf' => ['application/pdf'],
    'doc' => ['application/msword', 'application/vnd.ms-office', 'application/octet-stream'],
    'docx' => [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/octet-stream',
    ],
];
$resumeMaxBytes = 5 * 1024 * 1024;

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Invalid request method.');
}

// Honeypot — real visitors never fill this hidden field
if (!empty($_POST['website_url'])) {
    respond(false, 'Submission rejected.');
}

// reCAPTCHA verification
$captchaResponse = trim($_POST['g-recaptcha-response'] ?? '');
if ($captchaResponse === '') {
    respond(false, 'Please confirm the captcha before submitting.');
}

$verifyPayload = http_build_query([
    'secret' => $secretKey,
    'response' => $captchaResponse,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
]);

$ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $verifyPayload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
]);
$verifyResponse = curl_exec($ch);
curl_close($ch);

$verifyResult = json_decode((string) $verifyResponse, true);
if (empty($verifyResult['success'])) {
    respond(false, 'Captcha verification failed. Please try again.');
}

// Field validation
$name = trim(strip_tags($_POST['name'] ?? ''));
$email = trim($_POST['email'] ?? '');
$phone = trim(strip_tags($_POST['phone'] ?? ''));
$position = trim(strip_tags($_POST['position'] ?? ''));
$experience = trim(strip_tags($_POST['experience'] ?? ''));
$portfolio = trim($_POST['portfolio'] ?? '');
$message = trim(strip_tags($_POST['message'] ?? ''));

$errors = [];
if ($name === '') {
    $errors[] = 'Name is required.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($phone === '') {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[+]?[\d\s()-]{7,20}$/', $phone)) {
    $errors[] = 'Enter a valid phone number.';
}
if ($position === '') {
    $errors[] = 'Position applying for is required.';
}
if ($portfolio !== '' && !filter_var($portfolio, FILTER_VALIDATE_URL)) {
    $errors[] = 'Enter a valid portfolio URL.';
}

// Resume upload validation — kept only in PHP's temp upload slot, never moved or stored
$resumeTmpPath = '';
$resumeName = '';
if (!isset($_FILES['resume']) || $_FILES['resume']['error'] === UPLOAD_ERR_NO_FILE) {
    $errors[] = 'Please attach your resume.';
} elseif ($_FILES['resume']['error'] !== UPLOAD_ERR_OK) {
    $errors[] = 'There was a problem uploading your resume. Please try again.';
} else {
    $resumeTmpPath = $_FILES['resume']['tmp_name'];
    $resumeName = $_FILES['resume']['name'];
    $resumeSize = $_FILES['resume']['size'];
    $resumeExt = strtolower(pathinfo($resumeName, PATHINFO_EXTENSION));

    if (!in_array($resumeExt, $resumeAllowedExtensions, true)) {
        $errors[] = 'Resume must be a PDF or Word document.';
    } elseif ($resumeSize > $resumeMaxBytes) {
        $errors[] = 'Resume must be under 5MB.';
    } elseif (!is_uploaded_file($resumeTmpPath)) {
        $errors[] = 'There was a problem uploading your resume. Please try again.';
    } else {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = finfo_file($finfo, $resumeTmpPath);
        finfo_close($finfo);

        if (!in_array($detectedMime, $resumeAllowedMimeTypes[$resumeExt], true)) {
            $errors[] = 'Resume file type could not be verified. Please upload a valid PDF or Word document.';
        }
    }
}

if (!empty($errors)) {
    respond(false, implode(' ', $errors));
}

$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safePosition = htmlspecialchars($position, ENT_QUOTES, 'UTF-8');
$safeExperience = htmlspecialchars($experience !== '' ? $experience : '-', ENT_QUOTES, 'UTF-8');
$safePortfolio = htmlspecialchars($portfolio !== '' ? $portfolio : '-', ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message !== '' ? $message : '-', ENT_QUOTES, 'UTF-8'));

$internalHtml = "
<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>
<html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<title>New Job Application from $safeName</title>
</head>
<body>
<div class='jumbotron card card-body' style='box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;'>
<h2>New Job Application from the Website</h2>
<ul>
    <li><b>Name:</b> $safeName</li>
    <li><b>Email:</b> $safeEmail</li>
    <li><b>Phone:</b> $safePhone</li>
    <li><b>Position Applying For:</b> $safePosition</li>
    <li><b>Experience:</b> $safeExperience</li>
    <li><b>Portfolio / Website:</b> $safePortfolio</li>
    <li><b>Message:</b> $safeMessage</li>
</ul>
<p>Resume attached.</p>
</div>
</body>
</html>
";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUsername;
    $mail->Password = $smtpPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $smtpPort;

    $mail->setFrom($formEmail, $fromName);
    $mail->addAddress($toEmail);
    $mail->addCC($emailCc);
    $mail->addBCC($emailBcc);
    $mail->addReplyTo($email, $name);
    $mail->addAttachment($resumeTmpPath, $resumeName);

    $mail->isHTML(true);
    $mail->Subject = "New Job Application from $safeName";
    $mail->Body = $internalHtml;
    $mail->send();
} catch (Exception $e) {
    respond(false, 'We could not send your application right now. Please try again later.');
}

$replyHtml = "
<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>
<html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<title>Thank You for Applying to Envizon Studio</title>
</head>
<body>
<div class='jumbotron card card-body' style='box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;'>
<h2>Thank You for Applying to Envizon Studio</h2>
<p>Dear $safeName,</p>
<p>We have received your application and will get back to you within one business day.</p>
<p>Here are the details you provided:</p>
<ul>
    <li><b>Name:</b> $safeName</li>
    <li><b>Email:</b> $safeEmail</li>
    <li><b>Phone:</b> $safePhone</li>
    <li><b>Position Applying For:</b> $safePosition</li>
    <li><b>Experience:</b> $safeExperience</li>
    <li><b>Portfolio / Website:</b> $safePortfolio</li>
    <li><b>Message:</b> $safeMessage</li>
</ul>
<p>Thank you for your interest in joining Envizon Studio.</p>
</div>
</body>
</html>
";

$autoMail = new PHPMailer(true);
try {
    $autoMail->isSMTP();
    $autoMail->Host = $smtpHost;
    $autoMail->SMTPAuth = true;
    $autoMail->Username = $smtpUsername;
    $autoMail->Password = $smtpPassword;
    $autoMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $autoMail->Port = $smtpPort;

    $autoMail->setFrom($formEmail, $fromName);
    $autoMail->addAddress($email, $name);

    $autoMail->isHTML(true);
    $autoMail->Subject = 'Thank You for Applying to Envizon Studio';
    $autoMail->Body = $replyHtml;
    $autoMail->send();
} catch (Exception $e) {
    // Internal notification already sent — a failed auto-reply shouldn't fail the whole request.
}

respond(true, "Thanks — we've received your application and will be in touch if there's a fit.");
