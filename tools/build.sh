node delblock ../src/alog.js alog.lovely.js debug
node build alog.lovely.js alog.lovely.js
uglifyjs alog.lovely.js -o ../dist/alog.min.js --unsafe --lift-vars -c -nm
rm alog.lovely.js
