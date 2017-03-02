#!/usr/bin/env bash
#!/bin/bash

# Ubuntu 16.04 xenial

sudo apt-get install aptitude
sudo apt-get update
sudo aptitude install htop, nginx, xclip, gnupg, docker

# nginx setup
sudo mkdir /data
sudo mkdir /data/www
sudo mkdir /data/images
touch /data/www/index.html

# python setup, needs to be supervised for now
# environments can be switched with "source activate [py2 | py3]"
cd ~
wget https://repo.continuum.io/archive/Anaconda3-4.3.0-Linux-x86_64.sh
sudo bash Anaconda3-4.3.0-Linux-x86_64.sh
rm ~/Anaconda3-4.3.0-Linux-x86_64.sh
conda create -n py2 python=2 anaconda
conda create -n py3 python=3 anaconda
source activate py3
pip install MechanicalSoup
source activate py2
pip install MechanicalSoup

# clone getmoore.io repo (need personal access token for this)
cd ~/code
git clone https://github.com/yorktronic/getmoore.io.git

# vim setup (preferences, syntax highlighting for nginx.conf files)
echo "set tabstop=4" > ~/.vimrc
echo "set softtabstop=0 noexpandtab" >> ~/.vimrc
echo "set shiftwidth=4" >> ~/.vimrc
cp ~/code/getmoore.io/nginx/nginx.vim ~/.vim/syntax
echo "au BufRead,BufNewFile /etc/nginx/*,/usr/local/nginx/conf/* if &ft == '' | setfiletype nginx | endif" > ~/.vim/filetype.vim

# .bashrc stuff
echo "function ssh-encrypt() { rm ~/.ssh/id_rsa; }" >> ~/.bashrc
echo "function ssh-decrypt() {" >> ~/.bashrc
echo "    gpg ~/.ssh/id_rsa.gpg;" >> ~/.bashrc
echo "    chmod 400 ~/.ssh/id_rsa" >> ~/.bashrc
echo "}" >> ~/.bashrc

# SSLMate installation
sudo wget -P /etc/apt/sources.list.d https://sslmate.com/apt/ubuntu1604/sslmate.list
sudo wget -P /etc/apt/trusted.gpg.d https://sslmate.com/apt/ubuntu1604/sslmate.gpg
sudo aptitude update
sudo aptitude install sslmate
# Need to import SSL key

# docker
sudo add-apt-repository \
"deb https://apt.dockerproject.org/repo/ \
ubuntu-$(lsb_release -cs) \
main"
sudo apt-get update
sudo apt-get install docker-engine

# docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.11.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# rapid-service-template
cd ~/code
git clone git@github.com:yorktronic/rapid-service-template.git
cd rapid-service-template
ln -s compose/development.yml docker-compose.yml
scripts/generate_secret_key.sh
sudo docker-compose up -d
scripts/init_admin.sh "your_desired_username" "secret_password"
# once those are all done, you have to update nginx's config to do the proxy_pass to localhost:3333
