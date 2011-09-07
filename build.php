#!/usr/local/bin/php
<?php

define('DS', DIRECTORY_SEPARATOR);

// Config
$current_dir = dirname(__FILE__) . DS;
$build_dir = $current_dir . 'build' . DS;
$source_dir = $current_dir . 'src' . DS;
$main_file = 'gyudon';
$license_file = $current_dir . 'LICENSE';
$version = '0.1';

// Include JSMin

require_once $current_dir . 'jsmin.php';

// Functions

function trailing_slash($dir) {
  return rtrim($dir, DS) . DS;
}

function read_dir($dir, $recursive=false, $ext=null, $inc_dir=true, $inc_files=true) {
  $dir = trailing_slash($dir);
  $pattern = $dir . '*' . (empty($ext) ? '' : '.' . $ext);
  $files = array();
  foreach (glob($pattern) as $file) {
    if ((is_file($file) && $inc_files) || (is_dir($file) && $inc_dir)) {
      array_push($files, $file);
    }

    if (is_dir($file) && $recursive) {
      $files = array_merge($files, read_dir($file, $recursive, $ext, $inc_dir, $inc_files));
    }
  }
  return $files;
}

function import($to_import) {
  global $files, $version, $errors;

  if (!is_array($to_import)) {
    $to_import = array($to_import);
  }

  $first = true;
  foreach ($to_import as $file) {
    if (!isset($files[$file])) {
      array_push($errors, $file . ' doesnt exist');
      continue;
    }

    if ($first) {
      $first = false;
    } else {
      echo "\n\n";
    }
    require $files[$file];
  }
}

function filename($path) {
  if (defined('PATHINFO_FILENAME')) { // >= PHP 5.2.0
    $filename = pathinfo($path, PATHINFO_FILENAME);
  } else { // < PHP 5.2.0
    $basename = basename($path);
    $filename = substr($basename, 0, strrpos($basename, '.'));
  }
  return $filename;
}

function ext($path) {
  $basename = basename($path);
  return substr($basename, strrpos($basename, '.') + 1);
}

function minFilename($path) {
  return filename($path) . '.min.' . ext($path);
}

// Build gyudon.js

$filenames = read_dir($source_dir, true, null, false);

$files = array();
$errors = array();

foreach ($filenames as $path) {
  $files[filename($path)] = $path;
}

ob_start();
require $files[$main_file];
$content = ob_get_clean();
$min_content = JSMin::minify($content);

$generator_format = sprintf(
  "/* %%s v%s - generated at %s */\n\n",
  $version,
  date('Y.m.d H:i:s')
);

$generator = sprintf(
  $generator_format,
  basename($files[$main_file])
);

$min_generator = sprintf(
  $generator_format,
  minFilename($files[$main_file])
);

$license_text = file_get_contents($license_file);
$license_text = "/*\n" . preg_replace('/^(.*)$/m', ' * $1', trim($license_text)) . "\n */\n\n";
$content = $license_text . $generator . $content;
$min_content = $license_text . $min_generator . $min_content;

// TODO - should empty build directory first

if (file_put_contents($build_dir . basename($files[$main_file]), $content) === false) {
  array_push($errors, 'Failed to save main file in build directory');
} else if (file_put_contents($build_dir . minFilename($files[$main_file]), $min_content) === false) {
  array_push($errors, 'Failed to save minified main file in build directory');
}

if ($errors) {
  echo implode("\n", $errors) . "\n";
}
