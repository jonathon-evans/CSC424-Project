#!/bin/bash

if [ ! -f "./ctkeeper.txt" ] ; then
    touch "ctkeeper.txt"
    echo "1" > "ctkeeper.txt"
fi

subset=$(more "ctkeeper.txt")

curl --output `echo "./Set$subset/Fresh/FR$(date +"%s").jpg"` "http://freshfoodslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720"
curl --output `echo "./Set$subset/Starbucks/SB$(date +"%s").jpg"` "http://starbuckslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720"

subset=$(echo "$subset % 4 + 1" | bc)
echo $subset > "ctkeeper.txt"