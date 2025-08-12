// =========================
// AUTH STATE LISTENER
// =========================
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        const email = user.email;

        if (email === "admin@site.com" && currentPage !== "admin.html") {
            window.location.href = "admin.html";
        } else if (email !== "admin@site.com" && currentPage !== "user.html") {
            window.location.href = "user.html";
        }

        if (email === "admin@site.com" && currentPage === "admin.html") {
            loadProducts();
        } else if (email !== "admin@site.com" && currentPage === "user.html") {
            loadProductsForUser();
            loadCartCount();
        }
    } else {
        if (currentPage !== "index.html" && currentPage !== "") {
            window.location.href = "index.html";
        }
    }
});

// =========================
// SHOW/HIDE FORMS
// =========================
function showSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
}

function showLogin() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

// =========================
// LOGIN
// =========================
function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill in all fields" });
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            console.error("Login error:", error);
            Swal.fire({ icon: "error", title: "Login Failed", text: error.message });
        });
}

// =========================
// SIGNUP
// =========================
function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (!email || !password) {
        Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill in all fields" });
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            if (email === "admin@site.com") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "user.html";
            }
        })
        .catch((error) => {
            console.error("Signup error:", error);
            Swal.fire({ icon: "error", title: "Signup Failed", text: error.message });
        });
}

// =========================
// LOGOUT
// =========================
function logout() {
    auth.signOut()
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
}

// =========================
// ADMIN - ADD PRODUCT
// =========================
function addProduct() {
    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const description = document.getElementById("productDescription").value;
    const imageUrl = document.getElementById("productImage").value;

    if (!name || isNaN(price) || !description || !imageUrl) {
        Swal.fire({ icon: "warning", title: "Invalid Input", text: "Please fill in all fields correctly" });
        return;
    }

    db.collection("products").add({
        name: name,
        price: price,
        description: description,
        image: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            Swal.fire({ icon: "success", title: "Product Added", text: "Product added successfully!" });
            document.getElementById("productName").value = "";
            document.getElementById("productPrice").value = "";
            document.getElementById("productDescription").value = "";
            document.getElementById("productImage").value = "";
        })
        .catch((error) => {
            console.error("Error adding product:", error);
            Swal.fire({ icon: "error", title: "Error", text: error.message });
        });
}

// =========================
// ADMIN - LOAD PRODUCTS
// =========================
function loadProducts() {
    const productsList = document.getElementById("productsList");

    db.collection("products").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        if (snapshot.empty) {
            productsList.innerHTML = '<p>No products found</p>';
            return;
        }

        productsList.innerHTML = "";

        snapshot.forEach((doc) => {
            const product = doc.data();
            const productElement = document.createElement("div");
            productElement.className = "product-card";
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" style="max-width:200px;">
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <button onclick="editProduct('${doc.id}')">Edit</button>
                <button onclick="deleteProduct('${doc.id}')">Delete</button>
            `;
            productsList.appendChild(productElement);
        });
    });
}

// =========================
// ADMIN - EDIT PRODUCT
// =========================
function editProduct(productId) {
    Swal.fire({
        title: "Enter new product name:",
        input: "text",
        showCancelButton: true
    }).then((nameResult) => {
        if (!nameResult.value) return;

        Swal.fire({
            title: "Enter new price:",
            input: "number",
            showCancelButton: true
        }).then((priceResult) => {
            if (!priceResult.value) return;

            Swal.fire({
                title: "Enter new description:",
                input: "text",
                showCancelButton: true
            }).then((descResult) => {
                if (!descResult.value) return;

                db.collection("products").doc(productId).update({
                    name: nameResult.value,
                    price: parseFloat(priceResult.value),
                    description: descResult.value
                })
                    .then(() => {
                        Swal.fire({ icon: "success", title: "Updated", text: "Product updated successfully!" });
                    })
                    .catch((error) => {
                        console.error("Error updating product:", error);
                        Swal.fire({ icon: "error", title: "Error", text: error.message });
                    });
            });
        });
    });
}

// =========================
// ADMIN - DELETE PRODUCT
// =========================
function deleteProduct(productId) {
    Swal.fire({
        title: "Are you sure?",
        text: "This product will be deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("products").doc(productId).delete()
                .then(() => {
                    Swal.fire({ icon: "success", title: "Deleted", text: "Product deleted successfully!" });
                })
                .catch((error) => {
                    console.error("Error deleting product:", error);
                    Swal.fire({ icon: "error", title: "Error", text: error.message });
                });
        }
    });
}

// =========================
// USER - LOAD PRODUCTS
// =========================
function loadProductsForUser() {
    const productsList = document.getElementById("productsList");

    db.collection("products").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        if (snapshot.empty) {
            productsList.innerHTML = '<p>No products available</p>';
            return;
        }

        productsList.innerHTML = "";

        snapshot.forEach((doc) => {
            const product = doc.data();
            const productElement = document.createElement("div");
            productElement.className = "product-card";
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" style="max-width:200px;">
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <button onclick="addToCart('${doc.id}', '${product.name}', ${product.price})">Add to Cart</button>
            `;
            productsList.appendChild(productElement);
        });
    });
}

// =========================
// CART FUNCTIONS (Per-User)
// =========================
function addToCart(productId, productName, productPrice) {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire({ icon: "warning", title: "Not Logged In", text: "Please log in to add items to your cart." });
        return;
    }

    const userCartRef = db.collection("carts").doc(user.uid).collection("cartItems").doc(productId);

    userCartRef.get()
        .then((doc) => {
            if (doc.exists) {
                return userCartRef.update({
                    quantity: firebase.firestore.FieldValue.increment(1)
                });
            } else {
                return userCartRef.set({
                    name: productName,
                    price: productPrice,
                    quantity: 1,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .then(() => {
            Swal.fire({ icon: "success", title: "Added to Cart", text: `${productName} added to your cart!` });
            loadCartCount();
        })
        .catch((error) => {
            console.error("Error adding to cart:", error);
            Swal.fire({ icon: "error", title: "Error", text: error.message });
        });
}

function loadCartCount() {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("carts").doc(user.uid).collection("cartItems").onSnapshot((snapshot) => {
        const cartButton = document.getElementById("cartButton");
        cartButton.textContent = `Cart (${snapshot.size})`;
    });
}

function viewCart() {
    const user = auth.currentUser;
    if (!user) return;

    document.getElementById("productsSection").style.display = "none";
    document.getElementById("cartSection").style.display = "block";

    const cartList = document.getElementById("cartList");

    db.collection("carts").doc(user.uid).collection("cartItems").onSnapshot((snapshot) => {
        if (snapshot.empty) {
            cartList.innerHTML = '<p>Your cart is empty</p>';
            document.getElementById("cartTotal").textContent = "Total: $0.00";
            return;
        }

        cartList.innerHTML = "";
        let total = 0;

        snapshot.forEach((doc) => {
            const item = doc.data();
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
                <h4>${item.name}</h4>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Quantity: ${item.quantity}</p>
                <button onclick="updateQuantity('${doc.id}', ${item.quantity - 1})">-</button>
                <button onclick="updateQuantity('${doc.id}', ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart('${doc.id}')">Remove</button>
            `;
            cartList.appendChild(cartItem);
        });

        document.getElementById("cartTotal").textContent = `Total: $${total.toFixed(2)}`;
    });
}

function hideCart() {
    document.getElementById("cartSection").style.display = "none";
    document.getElementById("productsSection").style.display = "block";
}

function updateQuantity(itemId, newQuantity) {
    const user = auth.currentUser;
    if (!user) return;

    const itemRef = db.collection("carts").doc(user.uid).collection("cartItems").doc(itemId);

    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }

    itemRef.update({ quantity: newQuantity })
        .catch((error) => {
            console.error("Error updating quantity:", error);
            Swal.fire({ icon: "error", title: "Error", text: error.message });
        });
}

function removeFromCart(itemId) {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("carts").doc(user.uid).collection("cartItems").doc(itemId).delete()
        .catch((error) => {
            console.error("Error removing from cart:", error);
            Swal.fire({ icon: "error", title: "Error", text: error.message });
        });
}

function checkout() {
    const user = auth.currentUser;
    if (!user) return;

    Swal.fire({
        title: "Proceed to checkout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes"
    }).then((result) => {
        if (result.isConfirmed) {
            const userCartRef = db.collection("carts").doc(user.uid).collection("cartItems");

            userCartRef.get()
                .then((snapshot) => {
                    const batch = db.batch();
                    snapshot.forEach((doc) => {
                        batch.delete(doc.ref);
                    });
                    return batch.commit();
                })
                .then(() => {
                    Swal.fire({ icon: "success", title: "Order Placed", text: "Your cart has been cleared." });
                    hideCart();
                })
                .catch((error) => {
                    console.error("Error during checkout:", error);
                    Swal.fire({ icon: "error", title: "Error", text: error.message });
                });
        }
    });
}
