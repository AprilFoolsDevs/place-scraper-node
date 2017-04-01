while true
do
    rm /tmp/place.txt
    mysqldump -u reddit --p redditsips reddit place --fields-terminated-by=, --fields-enclosed-by='"' --lines-terminated-by=0x0a --tab /tmp
    cp /tmp/place.txt /var/www/html/place/export.csv
    sleep 300
done
