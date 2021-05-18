const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const attachEventHandlers = () => {
    // once the unordered list has been attached to the DOM
    // (by assigning the #artists container's innerHTML),
    // you can attach event handlers to the DOM:
    document.querySelectorAll('#all_doctors a').forEach(a => {
        a.onclick = showDetail;
    });
};


// 1: fetch all doctors and show in the lefthand panel
let doctors;
fetch('/doctors')
    .then(request => request.json())
    .then(data => {
        // store retrieved data in global variable called 'doctors'
        doctors = data
        const listItems = data.map(doctor => `
        <li>
            <a href="#" data-id="${doctor._id}">${doctor.name}</a>
        </li>`
        );
        document.getElementById('all_doctors').innerHTML = `
        <ol>
            ${listItems.join('')}
        </ol>
        <button onclick="addingForm()" class="btn">Add New Doctor</button>`
    })

    // at the end of all the doctor names, include button to add a doctor

    .then(attachEventHandlers)


// 2: when user clicks on doctors, show info: name, pic, seasons; and all companions
var selected_id
var selected_doctor
let companions

const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;
    selected_id = id;

    //  find current doctor from doctor array
    selected_doctor = doctors.filter(doctor => doctor._id === id)[0]
    console.log(selected_doctor);

    // append doctor template to DOM:
    document.querySelector('#doctor').innerHTML = `
    <div id="doctor_info">
    <button onclick="editDoctor()" class="btn btn-main" id="edit_btn">edit</button>
    <button onclick="deleteDoctor()" class="btn btn-main" id="delete_btn">delete</button>
    <h2> ${selected_doctor.name}</h2>
    <img src="${selected_doctor.image_url}" width="400px" />
    <br>
    <p>Seasons: ${selected_doctor.seasons}</p>
    </div>
    `;

    // also find the companions that traveled with the doctor
    fetch('/doctors/' + selected_id + '/companions')
        .then(response => response.json())
        .then(data => {
            // store retrieved data in global var 'companions'
            companions = data;
            // image on left, name on right
            const listItems = data.map(item => `
            <li> ${item.name}
            </li>
            <li> <img class="c" id="comp_img" src="${item.image_url}" width="100" height=120">
            </li>
            `
            );
            document.getElementById('companions').innerHTML = `
            <div id="companions_info">
            <ul>
                ${listItems.join('')}
            </ul>
            </div>`
        })
}


//  3: create a new doctor
function addingForm() {
    console.log('hey this works!')

    document.querySelector('#doctor').innerHTML = `
    <form id="new_doc_form">
    <!-- Name -->
    <label for="name">Name</label>
    <input type="text" id="name">

    <!-- Seasons -->
    <label for="seasons">Seasons</label>
    <input type="text" id="seasons">

    <!-- Ordering -->
    <label for="ordering">Ordering</label>
    <input type="text" id="ordering">

    <!-- Image -->
    <label for="image_url">Image</label>
    <input type="text" id="image_url">

    <!-- Buttons -->
    <button onclick="createDoctor()" class="btn btn-main" id="create">Save</button>
    <button onclick="cancelForm()" class="btn" id="cancel">Cancel</button>
</form>
    `
}

// hide the "detail" panels (middle and right)
function cancelForm() {
    console.log('cancelling form')
    var x = document.getElementById("new_doc_form");
    x.style.display = "none";

    document.getElementById("companions_info").style.display = "none"
}

function createDoctor() {
    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        image_url: document.getElementById('image_url').value,
        ordering: document.getElementById('ordering').value
    }

    fetch('/doctors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            } else {
                return response.json()
            }
        })

        // TODO: redraw lefthand panel to include new doctor
        // show doctor in "detail" panel
        .then(data => {
            console.log('was created', data);
            document.querySelector('#doctor').innerHTML = `
            <button onclick="editDoctor()" class="btn btn-main" id="edit_btn">edit</button>
            <button onclick="deleteDoctor()" class="btn btn-main" id="delete_btn">delete</button>
            <h2> ${data.name}</h2>
            <img src="${data.image_url}" width="400px" />
            <br>
            <p>Seasons: ${data.seasons}</p>
            `;

            doctors.push(data)

            const listItems = doctors.map(doctor => `
            <li>
                <a href="#" data-id="${doctor._id}">${doctor.name}</a>
            </li>`
            );

            document.getElementById('all_doctors').innerHTML = `
            <ol>
                ${listItems.join('')}
            </ol>
            <button onclick="addingForm()" class="btn">Add New Doctor</button>`

        })

        .catch(err => {
            console.error(err);
            alert("Entries are not valid--please enter fields in the correct formats.")
        })
        .then(attachEventHandlers);
    // Q: purpose of above line?
}


// 4: editing an existing doctor
// added edit button
function editDoctor() {
    console.log('editing doctor form')

    document.querySelector('#doctor').innerHTML = `
        <form id="new_doc_form">
        <!-- Name -->
        <label for="name">Name</label>
        <input type="text" id="name" value="${selected_doctor.name}">
    
        <!-- Seasons -->
        <label for="seasons">Seasons</label>
        <input type="text" id="seasons" value=${selected_doctor.seasons}>
    
        <!-- Ordering -->
        <label for="ordering">Ordering</label>
        <input type="text" id="ordering" value=${selected_doctor.ordering}>
    
        <!-- Image -->
        <label for="image_url">Image</label>
        <input type="text" id="image_url" value=${selected_doctor.image_url}>
    
        <!-- Buttons -->
        <button onclick="updateDoctor()" class="btn btn-main" id="create">Save</button>
        <button class="btn" onclick="originalDoctor()" id="cancel">Cancel</button>
    </form>
        `
        // TODO: when clicking cancel button, should just show original
}

function originalDoctor() {
    // console.log(selected_doctor)
    // reconstruct middle panel

    document.querySelector('#doctor').innerHTML = `
    <button onclick="editDoctor()" class="btn btn-main" id="edit_btn">edit</button>
    <h2> ${selected_doctor.name}</h2>
    <img src="${selected_doctor.image_url}" width="400px" />
    <br>
    <p>Seasons: ${selected_doctor.seasons}</p>
    `;

}

function updateDoctor() {
    console.log(selected_doctor)
    
    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        image_url: document.getElementById('image_url').value,
        ordering: document.getElementById('ordering').value
    }

    fetch('/doctors/' + selected_doctor._id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            // send to catch block:
            throw Error(response.statusText);
        } else {
            console.log('the updates were made!')
            console.log('response', response)
            return response.json();
        }
    })


    // after updating the doctor, show the updated doctor info in middle panel
    .then(data => {
        console.log("updating the middle panel");
        console.log("data", data)
        // doctors.push(data)
        document.querySelector('#doctor').innerHTML = `
        <button onclick="editDoctor()" class="btn btn-main" id="edit_btn">edit</button>
        <h2> ${data.name}</h2>
        <img src="${data.image_url}" width="400px" />
        <br>
        <p>Seasons: ${data.seasons}</p>
        `
// data holds all the new doctor info....

// TODO: must also update the left-hand panel


        // selected_doctor = data;
        // console.log('selected doctor', selected_doctor)

        // have to find the selected_doctor within doctors array
        // selected_doctor = doctors.filter(doctor => doctor._id === id)[0]

        let docToReplace = doctors.filter(doctor => doctor._id === selected_doctor._id)[0]
        // console.log(docToReplace)
        let index = docToReplace.ordering - 1

        doctors[index] = data;
        // console.log('doctors[index]', doctors[index])

        // docToReplace = data;
        // console.log('hopefully the updated one', docToReplace)

        const listItems = doctors.map(doctor => `
        <li>
            <a href="#" data-id="${doctor._id}">${doctor.name}</a>
        </li>`
        );
        console.log("list items after editing", listItems)

        // putting all elements of doctors in a list
        document.getElementById('all_doctors').innerHTML = `
        <ol>
        ${listItems.join('')}
        </ol>
        <button onclick="addingForm()" class="btn">Add New Doctor</button>`
    })

    .catch(err => {
        console.error(err);
        alert('Entries are not valid. Please enter fields in the correct formats!');
    })
    .then(attachEventHandlers);


    // now that the doctor was updated, have to update the middle panel

}


// 5: delete a doctor
// confirmation message: ask if whether they're sure they want to delete

function deleteDoctor() {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
        // if user says "OK", issue delete request to /doctors/:id
        fetch('/doctors/' + selected_doctor._id, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block
                throw Error(response.statusText);
            } else {
                return response.text()
            }
        })
        // now hiding both middle and right detail panels
        .then(data => {
            console.log('tis deleted', data);
            // console.log('cancelling form')
            var x = document.getElementById("doctor_info");
            x.style.display = "none";

            document.getElementById("companions_info").style.display = "none"


            // now must delete on lefthand side

            // must update doctors
            // first find the index in doctors we need to delete, then splice there
            // let docToDelete = doctors.filter(doctor => doctor._id === selected_doctor._id)[0]
            // console.log("doc to delete", docToDelete)


            // let index = doctors.indexOf(data)
            // console.log('doctors', doctors)
            // console.log('index', index)

            // doctors.splice(index, 1)

            // const listItems = doctors.map(doctor => `
            // <li>
            //     <a href="#" data-id="${doctor._id}">${doctor.name}</a>
            // </li>`
            // );
            // console.log("list items after editing", listItems)
    
            // // putting all elements of doctors in a list
            // document.getElementById('all_doctors').innerHTML = `
            // <ol>
            // ${listItems.join('')}
            // </ol>
            // <button onclick="addingForm()" class="btn">Add New Doctor</button>`
            // console.log('okay left side')
            
        })
        .catch(err => {
            console.error(err);
            alert('Error!');
        });
        // .then(attachEventHandlers);
        // TODO: redraw left-hand panel



        // if user cancels, TODO: do we really need the else statement below?
    }
    else {
        console.log('im here now')
        document.querySelector('#doctor').innerHTML = `
        <button onclick="editDoctor()" class="btn btn-main" id="edit_btn">edit</button>
        <button onclick="deleteDoctor()" class="btn btn-main" id="delete_btn">delete</button>
        <h2> ${data.name}</h2>
        <img src="${data.image_url}" width="400px" />
        <br>
        <p>Seasons: ${data.seasons}</p>
        `;
}
    }

// invoke this function when the page loads:
initResetButton();