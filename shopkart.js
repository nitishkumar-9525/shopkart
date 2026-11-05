

document.addEventListener("DOMContentLoaded", function () {

    // 1. Product Data
    const products = [
        { id: 1, name: "Wireless Headphones", price: 1499, category: "Electronics", icon: "🎧" },
        { id: 2, name: "Smart Watch", price: 2499, category: "Electronics", icon: "⌚" },
        { id: 3, name: "Running Shoes", price: 1999, category: "Fashion", icon: "👟" },
        { id: 4, name: "Laptop Backpack", price: 999, category: "Fashion", icon: "🎒" },
        { id: 5, name: "Bluetooth Speaker", price: 1299, category: "Electronics", icon: "🔊" },
        { id: 6, name: "Sunglasses", price: 599, category: "Fashion", icon: "🕶️" }
    ];

    // 2. Application Data
    let cart = [];
    let orders = [];
    let selectedCategory = "All";

    // 3. HTML Elements
    const productList = document.getElementById("product-list");
    const searchInput = document.getElementById("search");
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
    const emptyCart = document.getElementById("empty-cart");
    const cartStatus = document.getElementById("cart-status");
    const checkout = document.getElementById("checkout");
    const checkoutForm = document.getElementById("checkout-form");
    const checkoutTotal = document.getElementById("checkout-total");
    const successSection = document.getElementById("order-success");
    const orderMessage = document.getElementById("order-message");
    const orderStatus = document.getElementById("order-status");
    const orderSummary = document.getElementById("order-summary");
    const cancelButton = document.getElementById("cancel-order");
    const returnButton = document.getElementById("return-order");

    // 4. Load saved demo data
    try {
        cart = JSON.parse(localStorage.getItem("shopkartCart")) || [];
        orders = JSON.parse(localStorage.getItem("shopkartOrders")) || [];
    } catch (error) {
        cart = [];
        orders = [];
    }

    function saveData() {
        localStorage.setItem("shopkartCart", JSON.stringify(cart));
        localStorage.setItem("shopkartOrders", JSON.stringify(orders));
    }

    function formatPrice(amount) {
        return "₹" + amount.toLocaleString("en-IN");
    }

    function latestOrder() {
        return orders.length ? orders[orders.length - 1] : null;
    }

    // 5. Render Products
    function renderProducts() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = products.filter(function (product) {
            const matchesName = product.name.toLowerCase().includes(query);
            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;

            return matchesName && matchesCategory;
        });

        productList.replaceChildren();

        if (filtered.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No products found.";
            productList.appendChild(message);
            return;
        }

        filtered.forEach(function (product) {
            const card = document.createElement("article");
            card.className = "product-card";

            const icon = document.createElement("div");
            icon.className = "product-icon";
            icon.textContent = product.icon;

            const category = document.createElement("span");
            category.className = "category";
            category.textContent = product.category;

            const name = document.createElement("h3");
            name.textContent = product.name;

            const price = document.createElement("p");
            price.className = "product-price";
            price.textContent = formatPrice(product.price);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-primary";
            button.textContent = "Add to Cart";
            button.addEventListener("click", function () {
                addToCart(product.id);
            });

            card.append(icon, category, name, price, button);
            productList.appendChild(card);
        });
    }

    // 6. Add Product to Cart
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existing = cart.find(item => item.id === productId);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        cartStatus.textContent = product.name + " added to cart.";
        successSection.hidden = true;
        saveData();
        updateCart();
    }

    // 7. Quantity and Remove Functions
    function changeQuantity(id, change) {
        const item = cart.find(p => p.id === id);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            removeProduct(id);
            return;
        }

        saveData();
        updateCart();
    }

    function removeProduct(id) {
        cart = cart.filter(item => item.id !== id);
        saveData();
        updateCart();
    }

    function cartTotalAmount() {
        return cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }

    // 8. Update Cart Display
    function updateCart() {
        cartItems.replaceChildren();

        let quantityTotal = 0;

        cart.forEach(function (item) {
            quantityTotal += item.quantity;

            const li = document.createElement("li");
            const line = document.createElement("div");
            line.className = "cart-item-line";

            const name = document.createElement("span");
            name.className = "item-name";
            name.textContent =
                item.name + " — " +
                formatPrice(item.price * item.quantity);

            const minus = document.createElement("button");
            minus.type = "button";
            minus.className = "btn btn-light quantity-btn";
            minus.textContent = "−";
            minus.addEventListener("click", () =>
                changeQuantity(item.id, -1)
            );

            const qty = document.createElement("span");
            qty.textContent = item.quantity;

            const plus = document.createElement("button");
            plus.type = "button";
            plus.className = "btn btn-light quantity-btn";
            plus.textContent = "+";
            plus.addEventListener("click", () =>
                changeQuantity(item.id, 1)
            );

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "btn btn-light";
            remove.textContent = "Remove";
            remove.addEventListener("click", () =>
                removeProduct(item.id)
            );

            line.append(name, minus, qty, plus, remove);
            li.appendChild(line);
            cartItems.appendChild(li);
        });

        cartCount.textContent = quantityTotal;
        cartTotal.textContent = formatPrice(cartTotalAmount());
        checkoutTotal.textContent = formatPrice(cartTotalAmount());
        emptyCart.hidden = cart.length !== 0;
    }

    // 9. Clear Cart
    document.getElementById("clear-cart").addEventListener("click", function () {
        cart = [];
        saveData();
        updateCart();
        cartStatus.textContent = "Cart cleared.";
    });

    // 10. Checkout
    document.getElementById("checkout-btn").addEventListener("click", function () {
        if (cart.length === 0) {
            cartStatus.textContent = "Please add a product before checkout.";
            return;
        }

        cartStatus.textContent = "";
        checkoutTotal.textContent = formatPrice(cartTotalAmount());
        checkout.hidden = false;
        successSection.hidden = true;
        checkout.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("back-to-cart").addEventListener("click", function () {
        checkout.hidden = true;
        document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
    });

    // 11. Confirm Order
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        if (!checkoutForm.reportValidity()) return;

        const name = document.getElementById("customer-name").value.trim();
        const phone = document.getElementById("customer-phone").value.trim();
        const address = document.getElementById("customer-address").value.trim();
        const city = document.getElementById("customer-city").value.trim();
        const pincode = document.getElementById("customer-pincode").value.trim();

        if (!name || !address || !city ||
            !/^[6-9]\d{9}$/.test(phone) ||
            !/^\d{6}$/.test(pincode)) {
            alert("Please check your name, address, mobile number and PIN code.");
            return;
        }

        const order = {
            id: "SK" + Date.now().toString().slice(-8),
            customer: name,
            phone: phone,
            address: address,
            city: city,
            pincode: pincode,
            items: cart.map(item => ({ ...item })),
            total: cartTotalAmount(),
            payment: "Cash on Delivery",
            date: new Date().toLocaleString("en-IN"),
            status: "Confirmed"
        };

        orders.push(order);
        saveData();

        orderMessage.textContent =
            "Thank you, " + order.customer +
            "! Your order ID is " + order.id +
            ". Total: " + formatPrice(order.total) +
            ". Payment: Cash on Delivery.";

        orderStatus.textContent = order.status;
        renderOrderSummary(order);
        updateOrderButtons(order);

        cart = [];
        saveData();
        updateCart();

        checkoutForm.reset();
        checkout.hidden = true;
        successSection.hidden = false;
        renderProfile();

        successSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    function renderOrderSummary(order) {
        orderSummary.replaceChildren();

        order.items.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent =
                item.name + " × " + item.quantity +
                " — " + formatPrice(item.price * item.quantity);
            orderSummary.appendChild(li);
        });

        const total = document.createElement("li");
        total.textContent = "Total: " + formatPrice(order.total);
        orderSummary.appendChild(total);
    }

    // 12. Cancel and Return Buttons
    function updateOrderButtons(order) {
        const canAct = order && order.status === "Confirmed";
        cancelButton.hidden = !canAct;
        returnButton.hidden = !canAct;

        if (order) orderStatus.textContent = order.status;
    }

    cancelButton.addEventListener("click", function () {
        const order = latestOrder();
        if (!order || order.status !== "Confirmed") return;

        if (confirm("Do you want to cancel this order?")) {
            order.status = "Cancelled";
            saveData();
            orderStatus.textContent = order.status;
            orderMessage.textContent = "Order " + order.id + " cancelled.";
            updateOrderButtons(order);
            renderProfile();
        }
    });

    returnButton.addEventListener("click", function () {
        const order = latestOrder();
        if (!order || order.status !== "Confirmed") return;

        if (confirm("Do you want to request a return?")) {
            order.status = "Return Requested";
            saveData();
            orderStatus.textContent = order.status;
            orderMessage.textContent =
                "Return request submitted for order " + order.id + ".";
            updateOrderButtons(order);
            renderProfile();
        }
    });

    // 13. My Profile and Order History
    function renderProfile() {
        let profile = document.getElementById("profile");

        // Create the profile section if it isn't in the HTML yet.
        if (!profile) {
            profile = document.createElement("section");
            profile.id = "profile";
            profile.className = "panel";

            const heading = document.createElement("h2");
            heading.textContent = "My Profile - My Orders";

            const history = document.createElement("div");
            history.id = "order-history";

            profile.append(heading, history);
            document.querySelector("main").appendChild(profile);
        }

        let history = document.getElementById("order-history");

        if (!history) {
            history = document.createElement("div");
            history.id = "order-history";
            profile.appendChild(history);
        }

        history.replaceChildren();

        if (orders.length === 0) {
            const message = document.createElement("p");
            message.textContent = "You have not placed any orders yet.";
            history.appendChild(message);
            return;
        }

        orders.slice().reverse().forEach(function (order) {
            const card = document.createElement("article");
            card.className = "order-card";

            const heading = document.createElement("h3");
            heading.textContent = "Order ID: " + order.id;

            const date = document.createElement("p");
            date.textContent = "Date: " + order.date;

            const total = document.createElement("p");
            total.textContent = "Total: " + formatPrice(order.total);

            const status = document.createElement("p");
            status.textContent = "Status: " + order.status;

            const delivery = document.createElement("p");
            delivery.textContent =
                "Delivery: " + order.address + ", " +
                order.city + " - " + order.pincode;

            const items = document.createElement("ul");

            order.items.forEach(function (item) {
                const li = document.createElement("li");
                li.textContent =
                    item.name + " × " + item.quantity +
                    " — " + formatPrice(item.price * item.quantity);
                items.appendChild(li);
            });

            card.append(heading, date, total, status, delivery, items);

            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.className = "btn btn-light";
            cancel.textContent = "Cancel Order";
            cancel.hidden = order.status !== "Confirmed";

            cancel.addEventListener("click", function () {
                if (!confirm("Cancel order " + order.id + "?")) return;

                order.status = "Cancelled";
                saveData();
                renderProfile();

                if (latestOrder().id === order.id) {
                    updateOrderButtons(order);
                }
            });

            const returnBtn = document.createElement("button");
            returnBtn.type = "button";
            returnBtn.className = "btn btn-light";
            returnBtn.textContent = "Return Order";
            returnBtn.hidden = order.status !== "Confirmed";

            returnBtn.addEventListener("click", function () {
                if (!confirm("Request return for order " + order.id + "?")) return;

                order.status = "Return Requested";
                saveData();
                renderProfile();

                if (latestOrder().id === order.id) {
                    updateOrderButtons(order);
                }
            });

            card.append(cancel, returnBtn);
            history.appendChild(card);
        });
    }

    // 14. Continue Shopping
    document.getElementById("continue-shopping").addEventListener("click", function () {
        successSection.hidden = true;
        document.getElementById("home").scrollIntoView({ behavior: "smooth" });
    });

    // 15. Product Search
    searchInput.addEventListener("input", renderProducts);

    // 16. Category Filters
    document.querySelectorAll("[data-category]").forEach(function (link) {
        link.addEventListener("click", function () {
            selectedCategory = link.dataset.category;
            renderProducts();
        });
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
        if (!link.hasAttribute("data-category")) {
            link.addEventListener("click", function () {
                selectedCategory = "All";
                searchInput.value = "";
                renderProducts();
            });
        }
    });

    // 17. Initial Display
    renderProducts();
    updateCart();
    renderProfile();

    const savedOrder = latestOrder();
    if (savedOrder) {
        updateOrderButtons(savedOrder);
    } else {
        cancelButton.hidden = true;
        returnButton.hidden = true;
    }

});
