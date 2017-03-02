# Stuff to add to bashrc file for my user on an Ubuntu 16.04 LTS image
force_color_prompt=yes

# ssh private key encryption                  
function ssh-encrypt() { rm ~/.ssh/id_rsa; }  
                                              
function ssh-decrypt() {                      
    gpg ~/.ssh/id_rsa.gpg;                    
    chmod 400 ~/.ssh/id_rsa;                  
}                                             
                                              
# nav and git convenience functions                       
function mooreio() { cd ~/code/getmoore.io ; }
function gp() { git push origin master ; }    
function ga() { git add . ; }                 
function gca() { git commit -am "$*" ; }      
function pull() { git pull origin master; }   
function moore() { cd ~/code/getmoore ; }   