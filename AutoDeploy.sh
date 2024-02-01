#!/bin/bash

msg="build stie_$(date '+%Y-%m-%d.%H%M')"

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

#build site
hugo

#Copy public folder to parent
cp -r ./public ..

#Remove public folder
rm -r ./public

#Change git branch to master
git checkout master

#Remove public folder on parent
rm -r ../public

#Copy public folder to current pwd
cp -r ../public/* ./

#git Add everything
git add .

#commit to master
git commit -m "$msg"

# Push Site to master
git push origin master

#Change git branch to dev
git checkout dev