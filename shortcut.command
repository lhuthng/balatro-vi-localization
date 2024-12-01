mv lang* current/vi.lua
cp current/vi.lua ../Balatro/localization/vi.lua
cd ../Balatro
zip -9 -r Balatro.love .
cd ..
echo "Remove Balatro.love"
rm Balatro.love
echo "Move Balatro.love"
mv Balatro/Balatro.love Balatro.love
cd balatro-vi-localization