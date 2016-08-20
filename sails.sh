#!/bin/bash
#

PATH="/bin"

if echo "$0" | grep -q /
then
	cd `echo "$0" | sed 's%/[^/]*$%%'`
fi
APP=`pwd | sed 's%.*/%%'`
PIDFILE=/var/run/sails/$APP.pid

function running() {
	if [ ! -r "$PIDFILE" ]
	then
		return 1
	fi
	ps -fp `cat "$PIDFILE"` 2>/dev/null  >/dev/null
	return $?
}

function start() {

#	NODE_ENV=production sails lift --prod &
	sails lift &

	pid=$!
	if [ -z "$pid" ]
	then
		echo ERROR: No se inició el proceso sails
		exit 1
	fi
	echo -n "$pid" > "$PIDFILE"
	sleep 30
}

function stop() {
	kill `cat "$PIDFILE"` 2>/dev/null
	rm -f "$PIDFILE"
}

case "$1" in
	start)	if running
		then
			echo ERROR: El servicio $APP ya está iniciado
			exit 1
		fi
		start ;;
	stop)   if ! running
		then
			echo ERROR: El servicio $APP ya está detenido
			exit 1
		fi
		stop ;;
	restart) if running
		then
			stop
		fi
		start ;;
	status) if running
		then
			echo El servicio $APP está iniciado
		else
			echo El servicio $APP está detenido
		fi ;;
	*) echo "uso: start.sh [start | stop | restart]" ;;
esac

exit 0
