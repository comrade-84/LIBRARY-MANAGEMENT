
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const logInSection = document.querySelector(".login-container");
    const signUpSection = document.querySelector(".signup-container");
    const userDashboard = document.querySelector(".user-dashboard");
    const adminDashboard = document.querySelector(".admin-dashboard");
    const homeLogin = document.querySelector('.homeLogin');
    const showSignupLink = document.querySelector(".showSignup");
    const showLoginLink = document.querySelector(".showLogin");
    const subBtn = document.querySelector(".btn-signup");
    const logInBtn = document.querySelector(".btn-login");
    const bodyEl = document.querySelector("body");
    const logInEmail = document.querySelector(".email");
    const logInPassword = document.querySelector(".password");
    const signupEmail = document.querySelector(".s-email");
    const signupPassword = document.querySelector(".s-password");
    const signUpName = document.querySelector(".name");
    const confirmPassword = document.querySelector(".c-password");
    const userAvatar = document.querySelector("#userAvatar");
    const avatarImage = document.querySelector("#avatarImage");
    const viewProfileBtn = document.querySelector("#viewProfile");
    const logoutBtn = document.querySelector("#logout");
    const homeEl = document.querySelector('.home');
    const homeItems = document.querySelector('#homeBooks');
    const borrowedBooksEl = document.querySelector('#borrowed-books');
    const searchInput = document.querySelector('.searchInput');
    const searchBtn = document.querySelector('.searchBtn');
    const adminLink = document.querySelector('.admin-link');
    const addBookForm = document.querySelector('#add-book-form');
    const adminBookList = document.querySelector('#admin-book-list');
    const booksEl = document.querySelector('.books');
    const adminMetrics = document.querySelector('#admin-metrics');
    const adminActions = document.querySelector('#admin-actions');
    const heroSection = document.querySelector('.hero-section');
    const welcomeMessages = document.querySelectorAll('#welcomeMessage');
    const loaderOverlay = document.querySelector('#loaderOverlay');

    // Modal Elements
    const manageUsersModal = new bootstrap.Modal(document.getElementById('manageUsersModal'));
    const borrowingHistoryModal = new bootstrap.Modal(document.getElementById('borrowingHistoryModal'));
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const editBookModal = new bootstrap.Modal(document.getElementById('editBookModal'));
    const checkBorrowerModal = new bootstrap.Modal(document.getElementById('checkBorrowerModal'));

    // Initialize fetchedData and borrowedBooks
    let fetchedData = [];
    let borrowedBooks = [];

    try {
        const storedBooks = localStorage.getItem('itemBooks');
        fetchedData = storedBooks ? JSON.parse(storedBooks) : [];
    } catch (error) {
        console.error('Error parsing itemBooks from localStorage:', error);
    }

    // Loader Functions
    const showLoader = () => {
        if (loaderOverlay) loaderOverlay.classList.add('show');
    };

    const hideLoader = () => {
        if (loaderOverlay) loaderOverlay.classList.remove('show');
    };

    // Hardcode Librarian User
    const initializeLibrarian = () => {
        const users = JSON.parse(localStorage.getItem("user")) || [];
        const librarianExists = users.some(user => user.email === "l@exp.com");
        if (!librarianExists) {
            users.push({
                name: "Librarian",
                email: "l@exp.com",
                Password: "Admin123!",
                role: 'admin'
            });
            localStorage.setItem("user", JSON.stringify(users));
        }
    };
    initializeLibrarian();

    // Store books in local storage
    const storeBooks = () => {
        localStorage.setItem('itemBooks', JSON.stringify(fetchedData));
    };

    // Store user-specific borrowed books
    const storeBorrowedBooks = (userEmail) => {
        localStorage.setItem(`borrowedBooks_${userEmail}`, JSON.stringify(borrowedBooks));
    };

    // Load user-specific borrowed books
    const loadBorrowedBooks = (userEmail) => {
        try {
            const storedBorrowed = localStorage.getItem(`borrowedBooks_${userEmail}`);
            borrowedBooks = storedBorrowed ? JSON.parse(storedBorrowed) : [];
        } catch (error) {
            console.error(`Error parsing borrowedBooks_${userEmail} from localStorage:`, error);
            borrowedBooks = [];
        }
    };

    // Get borrower email for a specific book
    const getBorrowerEmail = (bookTitle) => {
        const users = JSON.parse(localStorage.getItem("user")) || [];
        for (const user of users) {
            const userBorrowedBooks = localStorage.getItem(`borrowedBooks_${user.email}`);
            if (userBorrowedBooks) {
                try {
                    const borrowedBooks = JSON.parse(userBorrowedBooks) || [];
                    if (borrowedBooks.some(book => book.Title === bookTitle)) {
                        return user.email;
                    }
                } catch (error) {
                    console.error(`Error parsing borrowedBooks_${user.email}:`, error);
                }
            }
        }
        return null;
    };

    // Calculate admin metrics
    const getAdminMetrics = () => {
        const booksLeft = fetchedData.filter(book => book.Availability === 'Available').length;
        const booksBorrowed = fetchedData.filter(book => book.Availability === 'Borrowed').length;
        const users = JSON.parse(localStorage.getItem("user")) || [];
        const activeUsers = users.filter(user => {
            const borrowed = localStorage.getItem(`borrowedBooks_${user.email}`);
            return borrowed && JSON.parse(borrowed)?.length > 0;
        }).length;
        return { booksLeft, booksBorrowed, activeUsers };
    };

    // Utility Functions
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateName = (name) => {
        if (name.length < 2) return { isValid: false, message: "Name must be at least 2 characters" };
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) return { isValid: false, message: "Name should only contain letters" };
        if (name !== name.trim()) return { isValid: false, message: "Name should not contain empty spaces" };
        return { isValid: true, message: "" };
    };

    const showError = (input, message) => {
        if (input) {
            input.classList.add("error");
            const errorElement = input.nextElementSibling;
            if (errorElement) errorElement.textContent = message;
        }
    };

    const clearError = (input) => {
        if (input) {
            input.classList.remove("error");
            const errorElement = input.nextElementSibling;
            if (errorElement) errorElement.textContent = "";
        }
    };

    // Admin Action Handlers
    const manageUsers = () => {
        const users = JSON.parse(localStorage.getItem("user")) || [];
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-user-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-user-btn" data-index="${index}">Delete</button>
                </td>
            `;
            userList.appendChild(tr);
        });

        manageUsersModal.show();

        // Edit User
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                const user = users[index];
                const newRole = prompt(`Enter new role for ${user.name} (admin/user):`, user.role);
                if (newRole && (newRole === 'admin' || newRole === 'user')) {
                    showLoader();
                    setTimeout(() => {
                        users[index].role = newRole;
                        localStorage.setItem("user", JSON.stringify(users));
                        manageUsers();
                        hideLoader();
                    }, 1000);
                }
            });
        });

        // Delete User
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                const user = users[index];
                document.getElementById('confirmModalMessage').textContent = `Are you sure you want to delete user ${user.name}?`;
                confirmModal.show();
                const confirmBtn = document.getElementById('confirmModalBtn');
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                newConfirmBtn.addEventListener('click', () => {
                    showLoader();
                    setTimeout(() => {
                        localStorage.removeItem(`borrowedBooks_${user.email}`);
                        users.splice(index, 1);
                        localStorage.setItem("user", JSON.stringify(users));
                        manageUsers();
                        confirmModal.hide();
                        hideLoader();
                    }, 1000);
                });
            });
        });

        renderAdminBooks();
    };

    const viewBorrowingHistory = () => {
        const users = JSON.parse(localStorage.getItem("user")) || [];
        const historyList = document.getElementById('borrowingHistoryList');
        historyList.innerHTML = '';
        let hasHistory = false;
        users.forEach(user => {
            const borrowed = localStorage.getItem(`borrowedBooks_${user.email}`);
            if (borrowed) {
                const books = JSON.parse(borrowed) || [];
                books.forEach(book => {
                    hasHistory = true;
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${book.Title}</td>
                    `;
                    historyList.appendChild(tr);
                });
            }
        });
        if (!hasHistory) {
            historyList.innerHTML = '<tr><td colspan="3">No borrowing history available.</td></tr>';
        }
        borrowingHistoryModal.show();
    };

    const generateReport = () => {
        showLoader();
        setTimeout(() => {
            const { booksLeft, booksBorrowed, activeUsers } = getAdminMetrics();
            const users = JSON.parse(localStorage.getItem("user")) || [];
            let csv = 'Report Type,Details\n';
            csv += `Books Available,${booksLeft}\n`;
            csv += `Books Borrowed,${booksBorrowed}\n`;
            csv += `Active Users,${activeUsers}\n`;
            csv += '\nBooks:\n';
            csv += 'Title,Author,Genre,Availability\n';
            fetchedData.forEach(book => {
                csv += `"${book.Title}","${book.Author || 'Unknown'}","${book.Genre}","${book.Availability}"\n`;
            });
            csv += '\nUsers:\n';
            csv += 'Name,Email,Role\n';
            users.forEach(user => {
                csv += `"${user.name}","${user.email}","${user.role}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'library_report.csv';
            a.click();
            URL.revokeObjectURL(url);
            hideLoader();
        }, 1000);
    };

    const clearBorrowedBooks = () => {
        document.getElementById('confirmModalMessage').textContent = 'Are you sure you want to reset all borrowed books to Available? This cannot be undone.';
        confirmModal.show();
        const confirmBtn = document.getElementById('confirmModalBtn');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', () => {
            showLoader();
            setTimeout(() => {
                fetchedData.forEach(book => {
                    if (book.Availability === 'Borrowed') {
                        book.Availability = 'Available';
                    }
                });
                const users = JSON.parse(localStorage.getItem("user")) || [];
                users.forEach(user => {
                    localStorage.removeItem(`borrowedBooks_${user.email}`);
                });
                storeBooks();
                renderAdminBooks();
                confirmModal.hide();
                hideLoader();
            }, 1000);
        });
    };

    // Render Borrowed Books
    const renderBorrowedBooks = () => {
        if (!borrowedBooksEl) return;
        borrowedBooksEl.innerHTML = '';

        borrowedBooks.forEach((data, index) => {
            const card = document.createElement('div');
            card.classList.add('text-center', 'rounded', 'book-card', 'p-3', 'm-4');
            card.innerHTML = `
                <img class="card-cover my-2" src='${data.CoverImage}' alt="">
                <h3 class="fs-5 text-center">${data.Title}</h3>
                <p class="fs-6 text-center">Author: ${data.Author || 'Unknown'}</p>
                <p class="card-text fs-6"><strong>Genre:</strong> ${data.Genre}</p>
                <span class="badge availability-badge bg-danger">Borrowed</span><br>
                <button class="btn btn-secondary return-btn mt-2" data-index="${index}">Return</button>
            `;
            borrowedBooksEl.appendChild(card);
        });

        document.querySelectorAll('.return-btn').forEach(button => {
            button.addEventListener('click', function () {
                showLoader();
                setTimeout(() => {
                    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
                    const index = this.getAttribute('data-index');
                    const book = borrowedBooks[index];
                    const bookIndex = fetchedData.findIndex(b => b.Title === book.Title);
                    if (bookIndex !== -1) {
                        fetchedData[bookIndex].Availability = 'Available';
                    }
                    borrowedBooks.splice(index, 1);
                    storeBooks();
                    storeBorrowedBooks(loggedInUser.email);
                    renderBorrowedBooks();
                    hideLoader();
                }, 1000);
            });
        });

        if (borrowedBooksEl) {
            borrowedBooksEl.classList.add('show');
        }
    };

    // Render User Dashboard
    const renderUserBooks = () => {
        try {
            const storedBooks = localStorage.getItem('itemBooks');
            fetchedData = storedBooks ? JSON.parse(storedBooks) : fetchedData;
        } catch (error) {
            console.error('Error reloading itemBooks from localStorage:', error);
        }

        if (homeItems) homeItems.innerHTML = '';

        fetchedData.forEach((data, index) => {
            if (!homeItems) return;
            const card = document.createElement('div');
            card.classList.add('text-center', 'rounded', 'book-card', 'p-3', 'm-4');
            card.innerHTML = `
                <img class="card-cover my-2" src='${data.CoverImage}' alt="">
                <h3 class="fs-5 text-center">${data.Title}</h3>
                <p class="fs-6 text-center">Author: ${data.Author || 'Unknown'}</p>
                <p class="card-text fs-6"><strong>Genre:</strong> ${data.Genre}</p>
                <span class="badge availability-badge ${data.Availability === 'Available' ? 'bg-success' : 'bg-danger'}">${data.Availability}</span><br>
                ${data.Availability === 'Available' ? `<button class="btn btn-primary borrow-btn mt-2" data-index="${index}">Borrow</button>` : ''}
            `;
            homeItems.appendChild(card);
        });

        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', function () {
                const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
                if (!loggedInUser) {
                    document.getElementById('confirmModalMessage').textContent = "Please log in to borrow books.";
                    confirmModal.show();
                    return;
                }
                showLoader();
                setTimeout(() => {
                    const index = this.getAttribute('data-index');
                    fetchedData[index].Availability = 'Borrowed';
                    borrowedBooks.push(fetchedData[index]);
                    storeBooks();
                    storeBorrowedBooks(loggedInUser.email);
                    renderUserBooks();
                    hideLoader();
                }, 1000);
            });
        });
    };

    // Render Admin Dashboard
    const renderAdminBooks = () => {
        if (!adminBookList || !adminMetrics || !adminActions) return;

        const { booksLeft, booksBorrowed, activeUsers } = getAdminMetrics();
        adminMetrics.innerHTML = `
            <div class="d-flex flex-wrap justify-content-around">
                <div class="card text-white bg-primary mb-3 col-md-3 mx-2">
                    <div class="card-body">
                        <h5 class="card-title">Books Available</h5>
                        <p class="card-text">${booksLeft}</p>
                    </div>
                </div>
                <div class="card text-white bg-warning mb-3 col-md-3 mx-2">
                    <div class="card-body">
                        <h5 class="card-title">Books Borrowed</h5>
                        <p class="card-text">${booksBorrowed}</p>
                    </div>
                </div>
                <div class="card text-white bg-success mb-3 col-md-3 mx-2">
                    <div class="card-body">
                        <h5 class="card-title">Active Users</h5>
                        <p class="card-text">${activeUsers}</p>
                    </div>
                </div>
            </div>
        `;

        adminActions.innerHTML = `
            <div class="d-flex flex-wrap justify-content-around mt-4">
                <div class="card bg-light mb-3 col-md-3 mx-2" onclick="manageUsers()">
                    <div class="card-body">
                        <h5 class="card-title">Manage Users</h5>
                        <p class="card-text">View, edit, or delete user accounts</p>
                    </div>
                </div>
                <div class="card bg-light mb-3 col-md-3 mx-2" onclick="viewBorrowingHistory()">
                    <div class="card-body">
                        <h5 class="card-title">Borrowing History</h5>
                        <p class="card-text">View all borrowing activity</p>
                    </div>
                </div>
                <div class="card bg-light mb-3 col-md-3 mx-2" onclick="generateReport()">
                    <div class="card-body">
                        <h5 class="card-title">Generate Report</h5>
                        <p class="card-text">Download CSV report</p>
                    </div>
                </div>
                <div class="card bg-light mb-3 col-md-3 mx-2" onclick="clearBorrowedBooks()">
                    <div class="card-body">
                        <h5 class="card-title">Clear Borrowed Books</h5>
                        <p class="card-text">Reset all books to Available</p>
                    </div>
                </div>
            </div>
        `;

        adminBookList.innerHTML = '';
        fetchedData.forEach((book, index) => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('admin-book-item');
            bookItem.innerHTML = `
                <div>
                    <strong>${book.Title}</strong> by ${book.Author || 'Unknown'} (${book.Genre})
                    <br>Status: ${book.Availability}
                </div>
                <div>
                    <button class="btn btn-warning btn-sm edit-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
                    <button class="btn btn-info btn-sm check-borrower-btn" data-title="${book.Title}">Check Borrower</button>
                </div>
            `;
            adminBookList.appendChild(bookItem);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                const book = fetchedData[index];
                document.getElementById('editBookTitle').value = book.Title;
                document.getElementById('editBookAuthor').value = book.Author || '';
                document.getElementById('editBookGenre').value = book.Genre;
                document.getElementById('editBookCover').value = book.CoverImage;
                document.getElementById('editBookIndex').value = index;
                editBookModal.show();
            });
        });

        document.getElementById('saveBookBtn').addEventListener('click', () => {
            const index = document.getElementById('editBookIndex').value;
            const newTitle = document.getElementById('editBookTitle').value;
            const newAuthor = document.getElementById('editBookAuthor').value;
            const newGenre = document.getElementById('editBookGenre').value;
            const newCover = document.getElementById('editBookCover').value;
            if (newTitle && newAuthor && newGenre && newCover) {
                showLoader();
                setTimeout(() => {
                    fetchedData[index] = {
                        ...fetchedData[index],
                        Title: newTitle,
                        Author: newAuthor,
                        Genre: newGenre,
                        CoverImage: newCover
                    };
                    storeBooks();
                    renderAdminBooks();
                    editBookModal.hide();
                    hideLoader();
                }, 1000);
            } else {
                document.getElementById('confirmModalMessage').textContent = "Please fill in all fields.";
                confirmModal.show();
            }
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                document.getElementById('confirmModalMessage').textContent = `Are you sure you want to delete "${fetchedData[index].Title}"?`;
                confirmModal.show();
                const confirmBtn = document.getElementById('confirmModalBtn');
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                newConfirmBtn.addEventListener('click', () => {
                    showLoader();
                    setTimeout(() => {
                        fetchedData.splice(index, 1);
                        storeBooks();
                        renderAdminBooks();
                        confirmModal.hide();
                        hideLoader();
                    }, 1000);
                });
            });
        });

        document.querySelectorAll('.check-borrower-btn').forEach(button => {
            button.addEventListener('click', function () {
                const bookTitle = this.getAttribute('data-title');
                const borrowerEmail = getBorrowerEmail(bookTitle);
                document.getElementById('checkBorrowerMessage').textContent = borrowerEmail
                    ? `"${bookTitle}" is borrowed by: ${borrowerEmail}`
                    : `"${bookTitle}" is not borrowed by any user.`;
                checkBorrowerModal.show();
            });
        });
    };

    // Search Functionality
    const handleSearch = () => {
        showLoader();
        setTimeout(() => {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const filteredItems = fetchedData.filter(item =>
                (item.Title?.toLowerCase().includes(searchTerm) || '') ||
                (item.Author?.toLowerCase().includes(searchTerm) || '') || (item.genre.toLowerCase().includes(searchTerm) || '')
            );
            if (homeItems) homeItems.innerHTML = '';
            if (filteredItems.length > 0) {
                filteredItems.forEach((data, index) => {
                    if (!homeItems) return;
                    const card = document.createElement('div');
                    card.classList.add('text-center', 'rounded', 'book-card', 'p-3', 'm-4');
                    card.innerHTML = `
                        <img class="card-cover my-2" src='${data.CoverImage}' alt="">
                        <h3 class="fs-5 text-center">${data.Title}</h3>
                        <p class="fs-6 text-center">Author: ${data.Author || 'Unknown'}</p>
                        <p class="card-text fs-6"><strong>Genre:</strong> ${data.Genre}</p>
                        <span class="badge availability-badge ${data.Availability === 'Available' ? 'bg-success' : 'bg-danger'}">${data.Availability}</span><br>
                        ${data.Availability === 'Available' ? `<button class="btn btn-primary borrow-btn mt-2" data-index="${index}">Borrow</button>` : ''}
                    `;
                    homeItems.appendChild(card);
                });

                document.querySelectorAll('.borrow-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
                        if (!loggedInUser) {
                            document.getElementById('confirmModalMessage').textContent = "Please log in to borrow books.";
                            confirmModal.show();
                            return;
                        }
                        showLoader();
                        setTimeout(() => {
                            const index = this.getAttribute('data-index');
                            fetchedData[index].Availability = 'Borrowed';
                            borrowedBooks.push(fetchedData[index]);
                            storeBooks();
                            storeBorrowedBooks(loggedInUser.email);
                            renderUserBooks();
                            hideLoader();
                        }, 1000);
                    });
                });
            } else if (homeItems) {
                homeItems.innerHTML = '<p>No items match your search. Please try again.</p>';
            }
            hideLoader();
        }, 1000);
    };

    // Show or hide elements based on login status
    const updateUI = (user) => {
        if (user) {
            if (homeLogin) homeLogin.classList.add('hidden');
            if (userAvatar) userAvatar.classList.remove("hidden");
            if (avatarImage) avatarImage.src = "./images/avartar.png";
            if (logInSection) logInSection.classList.add("hidden");
            if (signUpSection) signUpSection.classList.add("hidden");
            if (heroSection) heroSection.classList.add("hidden");

            if (user.role === 'admin') {
                if (adminLink) adminLink.classList.remove('hidden');
                if (adminDashboard) adminDashboard.classList.remove('hidden');
                if (userDashboard) userDashboard.classList.add('hidden');
                if (homeEl) homeEl.classList.add('hidden');
                welcomeMessages.forEach(wm => {
                    if (adminDashboard.contains(wm)) {
                        wm.textContent = `Welcome back, Admin ${user.name}!`;
                    }
                });
                renderAdminBooks();
            } else {
                if (adminLink) adminLink.classList.add('hidden');
                if (userDashboard) userDashboard.classList.remove('hidden');
                if (adminDashboard) adminDashboard.classList.add('hidden');
                if (homeEl) homeEl.classList.remove('hidden');
                welcomeMessages.forEach(wm => {
                    if (userDashboard.contains(wm)) {
                        wm.textContent = `Welcome back, ${user.name}!`;
                    }
                });
                loadBorrowedBooks(user.email);
                renderUserBooks();
            }
        } else {
            if (homeLogin) homeLogin.classList.remove('hidden');
            if (userAvatar) userAvatar.classList.add("hidden");
            if (logInSection) logInSection.classList.remove("hidden");
            if (userDashboard) userDashboard.classList.add("hidden");
            if (adminDashboard) adminDashboard.classList.add("hidden");
            if (adminLink) adminLink.classList.add('hidden');
            if (homeEl) homeEl.classList.remove('hidden');
            if (heroSection) heroSection.classList.remove("hidden");
            borrowedBooks = [];
            welcomeMessages.forEach(wm => wm.textContent = '');
        }
    };

    // Initialize UI based on logged-in user
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    updateUI(loggedInUser);

    // Form Switching
    if (showSignupLink) {
        showSignupLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (logInSection) logInSection.classList.add("hidden");
            if (signUpSection) signUpSection.classList.remove("hidden");
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (signUpSection) signUpSection.classList.add("hidden");
            if (logInSection) logInSection.classList.remove("hidden");
        });
    }

    if (homeLogin) {
        homeLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (logInSection) logInSection.classList.remove('hidden');
            if (userDashboard) userDashboard.classList.add('hidden');
            if (adminDashboard) adminDashboard.classList.add('hidden');
            if (heroSection) heroSection.classList.remove("hidden");
        });
    }

    // Signup Logic
    if (subBtn) {
        subBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let isValid = true;

            const nameValidation = validateName(signUpName?.value || '');
            if (!nameValidation.isValid) {
                showError(signUpName, nameValidation.message);
                isValid = false;
            } else {
                clearError(signUpName);
            }

            if (!validateEmail(signupEmail?.value || '')) {
                showError(signupEmail, "Please enter a valid email address");
                isValid = false;
            } else {
                clearError(signupEmail);
            }

            if (!validatePassword(signupPassword?.value || '')) {
                showError(signupPassword, "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number");
                isValid = false;
            } else {
                clearError(signupPassword);
            }

            if (confirmPassword?.value !== signupPassword?.value) {
                showError(confirmPassword, "Passwords do not match");
                isValid = false;
            } else {
                clearError(confirmPassword);
            }

            if (isValid) {
                showLoader();
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem("user")) || [];
                    users.push({
                        name: signUpName?.value,
                        email: signupEmail?.value,
                        Password: signupPassword?.value,
                        role: 'user'
                    });
                    localStorage.setItem("user", JSON.stringify(users));

                    if (signUpName) signUpName.value = "";
                    if (signupEmail) signupEmail.value = "";
                    if (signupPassword) signupPassword.value = "";
                    if (confirmPassword) confirmPassword.value = "";

                    if (signUpSection) signUpSection.classList.add("hidden");
                    if (logInSection) logInSection.classList.remove("hidden");
                    hideLoader();
                }, 3000);
            } else {
                document.getElementById('confirmModalMessage').textContent = "Please check the inputs.";
                confirmModal.show();
            }
        });
    }

    // Login Logic
    if (logInBtn) {
        logInBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let isValid = true;

            if (!validateEmail(logInEmail?.value || '')) {
                showError(logInEmail, "Please enter a valid email");
                isValid = false;
            } else {
                clearError(logInEmail);
            }

            if (!validatePassword(logInPassword?.value || '')) {
                showError(logInPassword, "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number");
                isValid = false;
            } else {
                clearError(logInPassword);
            }

            if (isValid) {
                showLoader();
                setTimeout(() => {
                    const storedUsers = JSON.parse(localStorage.getItem("user")) || [];
                    const user = storedUsers.find(u => u.email === (logInEmail?.value || '') && u.Password === (logInPassword?.value || ''));

                    if (user) {
                        localStorage.setItem("loggedInUser", JSON.stringify(user));
                        updateUI(user);
                    } else {
                        document.getElementById('confirmModalMessage').textContent = "Invalid email or password.";
                        confirmModal.show();
                    }
                    hideLoader();
                }, 3000);
            }
        });
    }

    // View Profile
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (loggedInUser) {
                document.getElementById('checkBorrowerMessage').textContent = `Name: ${loggedInUser.name}\nEmail: ${loggedInUser.email}\nRole: ${loggedInUser.role}`;
                document.getElementById('checkBorrowerModalLabel').textContent = 'User Profile';
                checkBorrowerModal.show();
            } else {
                document.getElementById('confirmModalMessage').textContent = "No user is logged in.";
                confirmModal.show();
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showLoader();
            setTimeout(() => {
                localStorage.removeItem("loggedInUser");
                updateUI(null);
                document.getElementById('confirmModalMessage').textContent = "You have been logged out.";
                confirmModal.show();
                location.reload();
                hideLoader();
            }, 1000);
        });
    }

    // Admin Dashboard Link
    if (adminLink) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (logInSection) logInSection.classList.add('hidden');
            if (userDashboard) userDashboard.classList.add('hidden');
            if (adminDashboard) adminDashboard.classList.remove('hidden');
            if (heroSection) heroSection.classList.add('hidden');
            renderAdminBooks();
        });
    }

    // Load Books for Users Only
    async function loadInitialBook() {
        showLoader();
        try {
            const response = await fetch('./initial.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            fetchedData = await response.json();
            storeBooks();
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (loggedInUser && loggedInUser.role !== 'admin') {
                loadBorrowedBooks(loggedInUser.email);
                renderUserBooks();
                if (userDashboard) userDashboard.classList.remove('hidden');
                if (logInSection) logInSection.classList.add('hidden');
                if (adminDashboard) adminDashboard.classList.add('hidden');
                if (heroSection) heroSection.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            if (fetchedData.length > 0) {
                const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
                if (loggedInUser && loggedInUser.role !== 'admin') {
                    loadBorrowedBooks(loggedInUser.email);
                    renderUserBooks();
                    if (userDashboard) userDashboard.classList.remove('hidden');
                    if (logInSection) logInSection.classList.add('hidden');
                    if (adminDashboard) adminDashboard.classList.add('hidden');
                    if (heroSection) heroSection.classList.add('hidden');
                }
            } else if (homeItems) {
                homeItems.innerHTML = '<p>Failed to fetch books. Please try again later.</p>';
            }
        } finally {
            hideLoader();
        }
    }

    // Fetch and Render Books on Home Button Click for Users Only
    if (homeEl) {
        homeEl.addEventListener('click', (e) => {
            e.preventDefault();
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (loggedInUser && loggedInUser.role === 'admin') {
                if (adminDashboard) adminDashboard.classList.remove('hidden');
                if (userDashboard) userDashboard.classList.add('hidden');
                if (logInSection) logInSection.classList.add('hidden');
                if (heroSection) heroSection.classList.add('hidden');
                renderAdminBooks();
            } else {
                loadInitialBook();
            }
        });

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (loggedInUser && loggedInUser.role !== 'admin') {
            loadInitialBook();
        } else if (loggedInUser && loggedInUser.role === 'admin') {
            renderAdminBooks();
        }
    }

    // Add Book Form Submission
    if (addBookForm) {
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.querySelector('#book-title')?.value || '';
            const author = document.querySelector('#book-author')?.value || '';
            const genre = document.querySelector('#book-genre')?.value || '';
            const cover = document.querySelector('#book-cover')?.value || '';
            showLoader();
            setTimeout(() => {
                fetchedData.push({
                    Title: title,
                    Author: author,
                    Genre: genre,
                    CoverImage: cover,
                    Availability: 'Available'
                });
                storeBooks();
                renderAdminBooks();
                if (addBookForm) addBookForm.reset();
                hideLoader();
            }, 1000);
        });
    }

    // Search Event Listeners
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key) handleSearch();
        });
    }

    // Books Element Click to Show Borrowed Books
    if (booksEl) {
        booksEl.addEventListener('click', (e) => {
            e.preventDefault();
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (loggedInUser && loggedInUser.role !== 'admin') {
                loadBorrowedBooks(loggedInUser.email);
                renderBorrowedBooks();
            } else {
                document.getElementById('confirmModalMessage').textContent = "Please log in as a user to view borrowed books.";
                confirmModal.show();
            }
        });
    }

    // Expose admin action functions to global scope for onclick
    window.manageUsers = manageUsers;
    window.viewBorrowingHistory = viewBorrowingHistory;
    window.generateReport = generateReport;
    window.clearBorrowedBooks = clearBorrowedBooks;
});
