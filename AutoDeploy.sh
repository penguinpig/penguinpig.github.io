#!/bin/bash

msg="build stie_$(date '+%Y-%m-%d.%H%M')"

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

#build site
hugo

#Save public folder by git stash
git add -f public
git stash save "temp"

#Change git branch to master
git checkout master

#Get public folder fom "git stash pop"
git stash pop

#git undo Add everything
git reset .

#Move public/* to parent
mv public/ ..

#git add everything
git add .

#commit to master
git commit -m "$msg"

# Push Site to master
git push origin master

#Change git branch to dev
git checkout dev