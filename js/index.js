const urlParams = new URLSearchParams(window.location.search);
let id = urlParams.get("id");

let email = document.querySelector("#email");
let dateReserva = document.querySelector("#fechaReserva");
let nameSolicitant = document.querySelector("#nombreSolicitante");
let selectSpace = document.querySelector("#espacios");
let descripReserva = document.querySelector("#descripReserva");
let tlfContact = document.querySelector("#tlfContacto");

let form = document.querySelector("#form");

let buttonSend = document.querySelector("input[type=submit]");

const urlApiSpaces = "https://intranetjacaranda.es/pruebaJS/espacios.php";
const urlApiReserva = "http://localhost:3000/reservas";

//Comprueba que el valor que le paso no es vacio
const isRequired = (value) => value !== "";
//Comprueba que el length que le he pasado esta entre el minimo y el maximo que le paso
const isBetween = (length,min,max) => length > min && length < max;

//Comprueba telefono valido con una expresion regular
const isTlfValid = (tlfV) => {
    const regex = /^[9|6|7]{1}[0-9]{8}$/;
    return regex.test(tlfV);
}

//Comprueba email valido con una expresion regular
const isEmailValid = (email) => {
    const re = /^(([^<>()\].,;:\s@"]+(\.[()\[\\.,;:\s@"]+)*)|(".+"))@(([0−9]1,3\.[0−9]1,3\.[0−9]1,3\.[0−9]1,3)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

//Muestra un error en el small correpodiente con el input y pone el borde rojo, añadiendo clases de css
const showError = (input,message) => {
    const formField = input.parentElement;

    formField.classList.remove("success");
    formField.classList.add("error");

    const error = formField.querySelector("small");
    error.textContent = message;
}

//Añade un borde verde al input que le hemos pasado, se hace añadiendo clases de css
const showSuccess = (input) => {
    const formField = input.parentElement;

    formField.classList.remove("error");
    formField.classList.add("success");
    const error = formField.querySelector("small");
    error.textContent = '';
}


//Función que comprueba el email
const checkEmail = async() => {
    let valid = false;

    const emailV = email.value;
    if(!isRequired(emailV)){
        showError(email,"El campo email es obligatorio");
    }else if(!isEmailValid(emailV)){
        showError(email,"El campo email no es de tipo email");
    }
    else{
        showSuccess(email);
        valid = true;
    }
    return valid;
}
const checkName = async() => {
    let valid = false;

    const nameV = nameSolicitant.value;
    if(!isRequired(nameV)){
        showError(nameSolicitant,"El campo nombre es obligatorio");
    }else{
        showSuccess(nameSolicitant);
        valid = true;
    }
    return valid;
}
const isValidaDate = (dateReserva) => {
    let dateNow = new Date();
    let dateReservaD = new Date(dateReserva);

    return (dateReservaD.getFullYear() == dateNow.getFullYear() 
    && dateReservaD.getMonth() <= dateNow.getMonth()  && dateReservaD.getDay() <= dateNow.getDay()
    || dateReservaD.getFullYear() == dateNow.getFullYear());
}
//Función que comprueba la fecha de la reserva
const chekDateReserva = () => {
    let valid = false;

    const dateReservaV = dateReserva.value;
    if(!isRequired(dateReservaV)){
        showError(dateReserva,"El campo fecha de la reserva  es obligatorio");
    }else if(!isValidaDate(dateReservaV)){
        showError(dateReserva,"Error la fecha tiene que ser menor que el dia de hoy");
    }else{
        showSuccess(dateReserva);
        valid = true;
    }
    return valid;
}

//Función que comprueba el telefono
const chekTlf = () => {
    let valid = false;

    const tlfV = tlfContact.value;
    if(!isRequired(tlfV)){
        showError(tlfContact,"El campo telefono de contacto es obligatorio");
    }else if(!isTlfValid(tlfV)){
        showError(tlfContact,"Telefono de contacto no valido");
    }else{
        showSuccess(tlfContact);
        valid = true;
    }
    return valid;
}


const loadSpaces = async () => {
    try {
        const response = await fetch(urlApiSpaces); 
        if (response.ok) { 
            const responseXml = await response.text(); 
            const parser = new DOMParser(); 
            const xmlDoc = parser.parseFromString(responseXml, "text/xml"); 
            const espacios = xmlDoc.querySelectorAll("espacio"); 

            espacios.forEach(espacio => {
                const id = espacio.querySelector("id").textContent; 
                const nombre = espacio.querySelector("nombre").textContent; 
                const option = new Option(nombre, id); 
                selectSpace.appendChild(option); 
            });
        }
    } catch (err) {
        console.log(err); 
    }
};

loadSpaces();
//Funcion que comprueba la descripcion
const checkDescrip = () => {
    let valid = false;

    const min = 20;

    const descripReservaV = descripReserva.value;
    if(!isRequired(descripReservaV)){
        showError(descripReserva,"El campo descripcion es obligatorio");
    }else if(descripReservaV.length < min){
        showError(descripReserva,`La descripción debe ser como minimo de ${min} caracteres`);
    }else{
        showSuccess(descripReserva);
        valid = true;
    }
    return valid;
}
//Funcion que carga los datos cuando vamos a editar
const loadDataEdit = async() => {
    const response = await fetch(`${urlApiReserva}?id=${id}`);
    if(response.ok){
        const responseJson = await response.json();
        let reserva = responseJson[0];
            if(reserva){
                dateReserva.value = reserva.fecha;
                nameSolicitant.value = reserva.nombre_solicitante;
                email.value =reserva.email_solicitante;

                tlfContact.value = reserva.telefono_contacto;
                selectSpace.value = reserva.espacio_reservado;
                descripReserva.value = reserva.descripcion;
                document.querySelector("#divEstado").removeAttribute("hidden");
            }else{
                showError(buttonSend,"Error no hay ninguna reserva con ese id");
            }

        
    }
}
//Cuando recibo el id cambio todo para ediar
if(id){
    buttonSend.value = "Editar";
    document.querySelector("#titleReserva").textContent = "Editar reserva";
    loadDataEdit();
}

nameSolicitant.addEventListener("change",checkName);
email.addEventListener("change",checkEmail);
dateReserva.addEventListener("change",chekDateReserva);
tlfContact.addEventListener("change",chekTlf);
descripReserva.addEventListener("change",checkDescrip);

const checkAll = async () => {
    return await checkEmail() && chekDateReserva() && chekTlf() && checkDescrip() && checkName();
}

form.addEventListener("submit",async(e) => {
    e.preventDefault();
    if(await checkAll()){
        let reserva = {"fecha":fechaReserva.value,
                        "nombre_solicitante":nameSolicitant.value,
                        "email_solicitante":email.value,
                        "telefono_contacto":tlfContact.value,
                        "espacio_reservado":selectSpace.value,
                        "descripcion":descripReserva.value,
                        "estado":"Pendiente"}
        if(id){
            await editReserva(reserva);
        }else{
            await addReserva(reserva);
        }
    }
})

const addReserva = async(reserva) => {
    try {
        const response = await fetch(urlApiReserva,{
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify(reserva)
        });

        if(response.ok){
            window.location.replace("list.html");
        }

    } catch (error) {
        console.log(error);
    }
}  

const editReserva = async(reserva) => {
    try {
        const response = await fetch(`${urlApiReserva}/${id}`,{
            method:"PUT",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify(reserva)
        });

        if(response.ok){
            window.location.replace("list.html");
        }

    } catch (error) {
        console.log(error);
    }
}  



