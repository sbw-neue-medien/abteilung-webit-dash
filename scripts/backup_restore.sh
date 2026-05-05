#!/usr/bin/env bash
unzip -p $1 | mariadb --host=127.0.0.1 --user=webit_abteilung --password=guessme webit_abteilung