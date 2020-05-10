#!/bin/bash

cd "/home/owner/Desktop/CSC424-Project"

/home/owner/.nvm/versions/node/v12.16.1/bin/node ./grabber.js

if false ; then

if [ ! -f "./ctkeeper.txt" ] ; then
    touch "ctkeeper.txt"
    echo "1" > "ctkeeper.txt"
fi

hour=$(date +"%H")
dow=$(date +"%u")
subset=$(more "ctkeeper.txt")

if [ $hour -ge 7 ] && [ $hour -le 21 ] ; then
    if [ $dow -le 4 ] || { [ $dow -ge 5 ] && [ $dow -le 6 ] && [ $hour -le 19 ] ; } || { [ $dow -eq 7 ] && [ $hour -ge 9 ] ; } ; then
        #curl --output `echo "./Set$subset/Fresh/FR$(date +"%s").jpg"` "http://freshfoodslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720"
        /usr/bin/wget -a "./wget-log.txt" -O "$(echo "./Set$subset/Fresh/FR$(date +"%s").jpg")" "http://freshfoodslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720"
    fi
fi

if [ $hour -ge 7 ] ; then
    if [ $dow -le 4 ] || { [ $dow -eq 5 ] && [ $hour -le 19 ] ; } || { [ $dow -eq 6 ] && [ $hour -ge 10 ] && [ $hour -le 18 ] ; } || { [ $dow -eq 7 ] && [ $hour -ge 12 ] ; } ; then
        #curl --output `echo "./Set$subset/Starbucks/SB$(date +"%s").jpg"` "http://starbuckslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720"
        /usr/bin/wget -a "./wget-log.txt" -O "$(echo "./Set$subset/Starbucks/SB$(date +"%s").jpg")" "http://starbuckslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720"
    fi
fi


subset=$(echo "$subset % 4 + 1" | bc)
echo $subset > "ctkeeper.txt"

echo "Grab Complete" >> "./wget-log.txt"

fi
