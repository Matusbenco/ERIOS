<?php
/**
 * ERIOS — jazykový loader
 *
 * Detekcia jazyka:
 *   1. ?lang=sk|cz|en  (override pre testovanie)
 *   2. doména v adresnom paneli:
 *        *.cz                  → cz
 *        en.*, *.com (mimo SK) → en
 *        ostatné               → sk (default)
 *
 * Použitie v šablónach: <?= $L['kluc'] ?>
 */

$supported = ['sk', 'cz', 'en'];
$lang_code = 'sk';

$host = strtolower($_SERVER['HTTP_HOST'] ?? '');

if (preg_match('/\.cz(:\d+)?$/i', $host) || strpos($host, 'erios.cz') !== false) {
    $lang_code = 'cz';
} elseif (strpos($host, 'en.') === 0 || preg_match('/\/en(\/|$)/', $_SERVER['REQUEST_URI'] ?? '')) {
    $lang_code = 'en';
}

if (isset($_GET['lang']) && in_array($_GET['lang'], $supported, true)) {
    $lang_code = $_GET['lang'];
}

$file = __DIR__ . "/lang/{$lang_code}.php";
if (!file_exists($file)) {
    $file = __DIR__ . '/lang/sk.php';
    $lang_code = 'sk';
}

$L = require $file;

$LANG_CODE = $lang_code;
$LANG_HTML = ['sk' => 'sk', 'cz' => 'cs', 'en' => 'en'][$lang_code];
$LANG_OG   = ['sk' => 'sk_SK', 'cz' => 'cs_CZ', 'en' => 'en_US'][$lang_code];
