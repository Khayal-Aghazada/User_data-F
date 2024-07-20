document.addEventListener('DOMContentLoaded', function() {
    const favList = document.getElementById('fav-list');
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalOverview = document.getElementById("modalOverview");
    const closeBtn = document.getElementsByClassName("close")[0];
    const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

    /* Display favorites start */
    // Function to display favorite users
    function displayFavorites() {
        const starredItems = JSON.parse(localStorage.getItem('starredItems')) || [];
        if (starredItems.length === 0) {
            favList.innerHTML = '<p>No favorites added yet.</p>';
            return;
        }

        fetch('https://6695303e4bd61d8314ca6826.mockapi.io/api/exercises')
            .then(response => response.json())
            .then(data => {
                favList.innerHTML = ''; 

                const filteredData = data.filter(user => starredItems.includes(user.id));
                filteredData.forEach(user => {
                    const userCard = document.createElement('div');
                    userCard.classList.add('user-card');
                    userCard.setAttribute('data-id', user.id); 
                    userCard.style.position = 'relative';

                    userCard.innerHTML = `
                        <i class="fa-solid fa-star" style="position: absolute; top: 10px; right: 10px; color: #ffeb3b; cursor: pointer;"></i>
                        <div>
                            <img src="${user.avatar}" alt="${user.userName}" width="100" height="100">
                        </div>
                        <div>
                            <p><strong>ID:</strong> ${user.id}</p>
                            <p><strong>Name:</strong> ${user.userName}</p>
                            <p><strong>Country:</strong> ${user.country}</p>
                            <p><strong>Department:</strong> ${user.department}</p>
                        </div>
                    `;

                    const starIcon = userCard.querySelector('.fa-star');
                    const isStarred = starredItems.includes(user.id);

                    if (isStarred) {
                        starIcon.classList.add('fa-solid');
                        starIcon.style.color = '#ffeb3b';
                    } else {
                        starIcon.classList.add('fa-regular');
                        starIcon.style.color = '#000000';
                    }

                    starIcon.addEventListener('click', function(event) {
                        event.stopPropagation();
                        let updatedStarredItems = JSON.parse(localStorage.getItem('starredItems')) || [];
                        updatedStarredItems = updatedStarredItems.filter(id => id !== user.id);
                        localStorage.setItem('starredItems', JSON.stringify(updatedStarredItems));
                        localStorage.setItem(`starred-${user.id}`, 'false'); // Update the specific star status

                        userCard.remove();

                        const userCardInUserList = document.querySelector(`.user-card[data-id="${user.id}"]`);
                        if (userCardInUserList) {
                            const starIconInUserList = userCardInUserList.querySelector('.fa-star');
                            if (starIconInUserList) {
                                starIconInUserList.classList.remove('fa-solid');
                                starIconInUserList.classList.add('fa-regular');
                                starIconInUserList.style.color = '#000000';
                            }
                        }

                        if (updatedStarredItems.length === 0) {
                            favList.innerHTML = '<p>No favorites added yet.</p>';
                        }
                    });

                    userCard.addEventListener('click', function() {
                        modalImg.src = user.avatar;
                        modalTitle.textContent = user.userName;
                        modalOverview.innerHTML = `
                            <p><strong>ID:</strong> ${user.id}</p>
                            <p><strong>Name:</strong> ${user.userName}</p>
                            <p><strong>Country:</strong> ${user.country}</p>
                            <p><strong>Department:</strong> ${user.department}</p>
                        `;
                        modal.style.display = "block";
                    });

                    favList.appendChild(userCard);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    /* Display favorites end */

    displayFavorites();

    /* Close modal start */
    // Event listener for closing the modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    /* Close modal end */

    /* Clear favorites start */
    // Clear Favorites button functionality
    clearFavoritesBtn.addEventListener('click', function() {
        localStorage.removeItem('starredItems');
        for (let key in localStorage) {
            if (key.startsWith('starred-')) {
                localStorage.removeItem(key);
            }
        }
        favList.innerHTML = '<p>No favorites added yet.</p>';
    });
    /* Clear favorites end */
});
