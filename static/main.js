//redirect to https
if (window.location.protocol != "https:")
    window.location.protocol = "https"
document.getElementById('circlebtn').addEventListener('click',toggleMenu)
const sidemenu = document.getElementById('sidemenu')
let menuOut = false
function toggleMenu(){
    if(menuOut){
        sidemenu.style.width = '0'
        menuOut = false
    }else{
        sidemenu.style.width = '210px'
        menuOut = true
    }
}
