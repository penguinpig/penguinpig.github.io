#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

#build site
hugo

#Copy public folder to parent
cp -r ./public ..

#Remove public folder
rm -r ./public

#Change git branch to master
git checkout master

#Copy public folder to current pwd
cp -r ../public/* ./

#commit to master
git commit -m "$msg"

# Push Site to master
git push origin master