#!/bin/bash
#
#


cd /home/erapetti/Presentismo
export NODE_ENV=production
exec sails lift --prod
