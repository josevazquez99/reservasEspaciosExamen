const listReservas = document.getElementById("listReservas");

const urlApiSpaces = "https://intranetjacaranda.es/pruebaJS/espacios.php";
const urlApiReserva = "http://localhost:3000/reservas";

const getReservas = async () => {
    try {
        const response = await fetch(urlApiReserva);
        if (response.ok) {
            const responseJson = await response.json();
            let reservas = Array.from(responseJson);
            reservas.forEach(async (reserva) => {
                if (reserva.estado == "Pendiente" || reserva.estado == "Aprobada") {
                    await addReservaToList(reserva);
                }
            })
        }
    } catch (error) {
        console.log(error);
    }
}

getReservas();

async function addReservaToList(reserva) {
    try {
        const responseSpace = await fetch(`${urlApiSpaces}?id=${reserva.espacio_reservado}`);
        if (responseSpace.ok) {
            const responseSpaceText = await responseSpace.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(responseSpaceText, "text/xml");
            const nombreEspacio = xmlDoc.getElementsByTagName("nombre")[0].childNodes[0].nodeValue;

            let li = document.createElement("li");
            li.appendChild(document.createTextNode(`${reserva.id}:${reserva.fecha}:${nombreEspacio}:${reserva.nombre_solicitante}:`));

            // Botón Ver Detalles
            let buttonEdit = document.createElement("button");
            buttonEdit.textContent = "Ver detalles";
            buttonEdit.setAttribute("data-id", reserva.id);
            let aEdit = document.createElement("a");
            aEdit.setAttribute("href", `index.html?id=${reserva.id}&espacio=${nombreEspacio}`);
            aEdit.appendChild(buttonEdit);
            li.appendChild(aEdit);

            // Botón Eliminar
            let buttonDelete = document.createElement("button");
            buttonDelete.textContent = "Eliminar";
            buttonDelete.setAttribute("data-id", reserva.id);
            buttonDelete.addEventListener("click", async () => {
                try {
                    const response = await fetch(`${urlApiReserva}/${reserva.id}`, {
                        method: "DELETE",
                    });
                    if (response.ok) {
                        listReservas.removeChild(li);
                        console.log("Reserva eliminada correctamente");
                    } else {
                        console.error("Error al eliminar la reserva");
                    }
                } catch (error) {
                    console.error(error);
                }
            });
            li.appendChild(buttonDelete);

            listReservas.appendChild(li);
        } else {
            console.error('Response not OK');
        }
    } catch (error) {
        console.error(error);
    }
}
