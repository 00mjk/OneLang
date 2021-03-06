<?php

namespace OneLang\Loader;

class OneLoader {
    static function init() {
        spl_autoload_register(function ($class) {
            $path = explode("\\", $class);
            $clsName = array_pop($path);
            $fileName = "src/" . implode("/", $path);
            if (!file_exists("$fileName.php"))
                print("[OneLoader] Class NOT FOUND: $class -> $fileName.php\n");
            else
                require_once("$fileName.php");
        });
    }
}
OneLoader::init();
