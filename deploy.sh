#!/usr/bin/env bash

set -e # 任意命令出错时终止运行
set -u # 变量不存在时报错
set -x # 在运行结果之前，先输出执行的那一行命令

scp -r * bing:/var/www/web