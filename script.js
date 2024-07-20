document.addEventListener('DOMContentLoaded', function () {
    const userList = document.getElementById('user-list');
    const searchInput = document.getElementById('search');
    const favoritesBtn = document.getElementById('favorites-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('addUserModal');
    const addUserForm = document.getElementById('addUserForm');
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalOverview = document.getElementById('modalOverview');
    const closeBtn = document.getElementsByClassName('close')[0];

    let updateFormSubmitListener = function (e) { };

    const chooseBestPlayerBtn = document.getElementById('choose-best-player-btn');
    const chooseBestPlayerModal = document.getElementById('chooseBestPlayerModal');
    const choosePlayerForm = document.getElementById('choosePlayerForm');

    let userData = [];

    /* Fetch data start */
    // Fetch data from the API and display users
    function fetchData() {
        fetch('https://6695303e4bd61d8314ca6826.mockapi.io/api/exercises')
            .then(response => response.json())
            .then(data => {
                userData = data;
                displayUsers(data);
                // Add event listener to filter users based on search input
                searchInput.addEventListener('input', function () {
                    filterUsers(data);
                });
                // Highlight the saved employee of the week
                highlightEmployeeOfTheWeek();
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    /* Fetch data end */

    /* Display users start */
    // Display users in the user list
    function displayUsers(data) {
        userList.innerHTML = '';

        data.forEach(user => {
            const userCard = document.createElement('div');
            userCard.classList.add('user-card');
            userCard.setAttribute('data-id', user.id);
            userCard.style.position = 'relative';

            const isStarred = localStorage.getItem(`starred-${user.id}`) === 'true';

            userCard.innerHTML = `
                <i class="fa-${isStarred ? 'solid' : 'regular'} fa-star" style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: ${isStarred ? '#ffeb3b' : '#000000'};"></i>
                <div>
                    <img src="${user.avatar}" alt="${user.userName}" width="100" height="100">
                </div>
                <div>
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Name:</strong> ${user.userName}</p>
                    <p><strong>Country:</strong> ${user.country}</p>
                    <p><strong>Department:</strong> ${user.department}</p>
                    <p><strong>Gender:</strong> ${user.gender}</p>
                </div>
                <div>
                    <button class="read-btn">Read</button>
                    <button class="update-btn">Update</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            // Handle starring users
            const starIcon = userCard.querySelector('.fa-star');
            starIcon.addEventListener('click', function (event) {
                event.stopPropagation();
                const isCurrentlyStarred = starIcon.classList.contains('fa-regular');
                starIcon.classList.toggle('fa-regular', !isCurrentlyStarred);
                starIcon.classList.toggle('fa-solid', isCurrentlyStarred);
                starIcon.style.color = isCurrentlyStarred ? '#ffeb3b' : '#000000';
                localStorage.setItem(`starred-${user.id}`, isCurrentlyStarred.toString());

                let starredItems = JSON.parse(localStorage.getItem('starredItems')) || [];
                if (isCurrentlyStarred) {
                    starredItems.push(user.id);
                } else {
                    starredItems = starredItems.filter(id => id !== user.id);
                }
                localStorage.setItem('starredItems', JSON.stringify(starredItems));
            });

            // Add event listeners for read, update, and delete buttons
            userCard.querySelector('.read-btn').addEventListener('click', function (event) {
                event.stopPropagation();
                openModal(user);
            });

            userCard.querySelector('.update-btn').addEventListener('click', function (event) {
                event.stopPropagation();
                openModal(user, true);
            });

            userCard.querySelector('.delete-btn').addEventListener('click', function (event) {
                event.stopPropagation();
                deleteUser(user.id, userCard);
            });

            userList.appendChild(userCard);
        });
    }
    /* Display users end */

    /* Open modal start */
    // Open modal for displaying/updating user details
    function openModal(user, isUpdate = false) {
        if (modalImg) {
            modalImg.src = user.avatar;
        }

        if (modalTitle) {
            modalTitle.textContent = user.userName;
        }

        const updateForm = document.getElementById('updateForm');
        if (isUpdate) {
            if (updateForm) {
                updateForm.style.display = 'block';
                document.getElementById('modalDetails').style.display = 'none';
                document.getElementById('updateName').value = user.userName;
                document.getElementById('updateEmail').value = user.email;
                document.getElementById('updateDepartment').value = user.department;

                // Remove the old event listener before adding a new one
                updateForm.removeEventListener('submit', updateFormSubmitListener);

                // Define a new event listener for form submission
                updateFormSubmitListener = function (e) {
                    e.preventDefault();
                    updateUser(user.id);
                };

                // Add the new event listener to the form
                updateForm.addEventListener('submit', updateFormSubmitListener);

                // Handle image update
                const updateImg = document.getElementById('updateImg');
                if (updateImg) {
                    updateImg.addEventListener('change', function (event) {
                        compressImage(event.target.files[0], function (compressedImage) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                document.getElementById('modalImg').src = e.target.result;
                            };
                            reader.readAsDataURL(compressedImage);
                        });
                    });
                }
            }
        } else {
            const modalDetails = document.getElementById('modalDetails');
            if (modalDetails) {
                updateForm.style.display = 'none';
                modalDetails.style.display = 'block';
                modalDetails.innerHTML = `
                    <p><strong>ID:</strong> ${user.id}</p>
                    <p><strong>Gender:</strong> ${user.gender}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Birthday:</strong> ${new Date(user.bd).toLocaleDateString()}</p>
                    <p><strong>Department:</strong> ${user.department}</p>
                    <p><strong>Married:</strong> ${user.isMarried ? 'Yes' : 'No'}</p>
                    <p><strong>Country:</strong> ${user.country}</p>
                    <p><strong>Pet:</strong> ${user.pet}</p>
                    <p><strong>Favourite Color:</strong> ${user.favouriteColor}</p>
                    <p><strong>Street:</strong> ${user.street}</p>
                `;
            }
        }

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function () {
                modal.style.display = "none";
            };
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };

        modal.style.display = "block";
    }
    /* Open modal end */

    /* Update user start */
    // Update user data
    function updateUser(userId) {
        const updatedUser = {
            avatar: document.getElementById('modalImg').src,
            userName: document.getElementById('updateName').value,
            email: document.getElementById('updateEmail').value,
            department: document.getElementById('updateDepartment').value
        };

        fetch(`https://6695303e4bd61d8314ca6826.mockapi.io/api/exercises/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        })
            .then(response => response.json())
            .then(data => {
                console.log('User updated:', data);
                fetchData();
                modal.style.display = "none";
            })
            .catch(error => console.error('Error updating user:', error));
    }
    /* Update user end */

    /* Compress image start */
    // Compress image before upload
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width / 2;
                canvas.height = img.height / 2;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(function (blob) {
                    callback(blob);
                }, 'image/jpeg', 0.7);
            };
        };
    }
    /* Compress image end */

    /* Delete user start */
    // Delete user
    function deleteUser(userId, userCard) {
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`https://6695303e4bd61d8314ca6826.mockapi.io/api/exercises/${userId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        userCard.remove();
                    } else {
                        alert('Failed to delete user.');
                    }
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user.');
                });
        }
    }
    /* Delete user end */

    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = "none";
        };
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    /* Filter users start */
    // Filter users based on search input
    function filterUsers(data) {
        const query = searchInput.value.toLowerCase();
        const filteredData = data.filter(user =>
            user.userName.toLowerCase().includes(query) || user.id.toString().includes(query)
        );
        displayUsers(filteredData);
    }
    /* Filter users end */

    /* Fetch initial data start */
    // Fetch initial data
    fetchData();
    /* Fetch initial data end */

    /* Favorites button event listener start */
    // Event listener for favorites button
    favoritesBtn.addEventListener('click', function () {
        window.location.href = 'fav.html';
    });
    /* Favorites button event listener end */

    /* Handle localStorage changes start */
    // Handle localStorage changes
    window.addEventListener('storage', function (event) {
        if (event.key.startsWith('starred-')) {
            const userId = event.key.split('-')[1];
            const isStarred = event.newValue === 'true';
            const userCard = document.querySelector(`.user-card[data-id="${userId}"]`);
            if (userCard) {
                const starIcon = userCard.querySelector('.fa-star');
                if (isStarred) {
                    starIcon.classList.add('fa-solid');
                    starIcon.classList.remove('fa-regular');
                    starIcon.style.color = '#ffeb3b';
                } else {
                    starIcon.classList.add('fa-regular');
                    starIcon.classList.remove('fa-solid');
                    starIcon.style.color = '#000000';
                }
            }
        }
    });
    /* Handle localStorage changes end */

    /* Add user button event listener start */
    // Event listener for "Add User" button
    addUserBtn.addEventListener('click', function () {
        addUserModal.style.display = 'block';
    });
    /* Add user button event listener end */

    /* Close add user modal start */
    // Event listener for close button on add user modal
    const addCloseBtn = addUserModal.querySelector('.close');
    if (addCloseBtn) {
        addCloseBtn.onclick = function () {
            addUserModal.style.display = 'none';
        };
    }
    /* Close add user modal end */

    /* Add user form submission start */
    // Handle form submission for adding a new user
    addUserForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newUser = {
            userName: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            department: document.getElementById('userDepartment').value,
            country: document.getElementById('userCountry').value,
            avatar: document.getElementById('userAvatar').value || 'https://via.placeholder.com/100',
            bd: new Date(document.getElementById('userBd').value).toISOString(),
            isMarried: document.getElementById('userIsMarried').checked,
            pet: document.getElementById('userPet').value,
            favouriteColor: document.getElementById('userFavouriteColor').value,
            street: document.getElementById('userStreet').value,
            gender: document.getElementById('userGender').value
        };

        fetch('https://6695303e4bd61d8314ca6826.mockapi.io/api/exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })
            .then(response => response.json())
            .then(data => {
                console.log('User added:', data);
                fetchData();
                addUserModal.style.display = 'none';
                addUserForm.reset();
            })
            .catch(error => console.error('Error adding user:', error));
    });
    /* Add user form submission end */

    /* Close add user modal on outside click start */
    // Close modal if clicked outside of modal content
    window.onclick = function (event) {
        if (event.target == addUserModal) {
            addUserModal.style.display = 'none';
        }
    };
    /* Close add user modal on outside click end */

    /* Choose best player button event listener start */
    // Event listener for "Choose the Best Player" button
    chooseBestPlayerBtn.addEventListener('click', function () {
        chooseBestPlayerModal.style.display = 'block';
    });
    /* Choose best player button event listener end */

    /* Close choose best player modal start */
    // Event listener for close button on choose best player modal
    const chooseCloseBtn = chooseBestPlayerModal.querySelector('.close');
    if (chooseCloseBtn) {
        chooseCloseBtn.onclick = function () {
            chooseBestPlayerModal.style.display = 'none';
        };
    }
    /* Close choose best player modal end */

    /* Choose best player form submission start */
    // Handle form submission for choosing the best player
    choosePlayerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const playerId = document.getElementById('playerId').value;

        // Find the user by ID
        const user = userData.find(user => user.id == playerId);

        if (user) {
            chooseBestPlayerModal.style.display = 'none';

            // Reset any existing gold card to default background color
            const previousGoldCard = document.querySelector('.user-card[style*="background-color: gold"]');
            if (previousGoldCard) {
                previousGoldCard.style.backgroundColor = '';
            }

            // Change the box color to gold
            const userCard = document.querySelector(`.user-card[data-id='${playerId}']`);
            if (userCard) {
                userCard.style.backgroundColor = 'gold';
                // Save the selected employee of the week to localStorage
                localStorage.setItem('employeeOfTheWeek', playerId);
            }

            Swal.fire({
                title: "Best employee of the week!",
                html: `Best employee this week is user with ID: <strong>${playerId}</strong>, ${user.userName}`,
                imageUrl: user.avatar,
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: "User Avatar"
            });
        } else {
            Swal.fire({
                title: "Error!",
                text: "No player found with the given ID.",
                icon: "error"
            });
        }
    });
    /* Choose best player form submission end */

    /* Highlight employee of the week start */
    // Highlight the employee of the week on page load
    function highlightEmployeeOfTheWeek() {
        const employeeOfTheWeekId = localStorage.getItem('employeeOfTheWeek');
        if (employeeOfTheWeekId) {
            const userCard = document.querySelector(`.user-card[data-id='${employeeOfTheWeekId}']`);
            if (userCard) {
                userCard.style.backgroundColor = 'gold';
            }
        }
    }
    /* Highlight employee of the week end */

    /* Close choose best player modal on outside click start */
    // Close modal if clicked outside of modal content
    window.onclick = function (event) {
        if (event.target == chooseBestPlayerModal) {
            chooseBestPlayerModal.style.display = 'none';
        }
    };
    /* Close choose best player modal on outside click end */
});
