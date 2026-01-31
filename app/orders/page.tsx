"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Save,
  Package,
  User as UserIcon,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { OrderProduct, Product, Order } from "@/types";
import { GET_PRODUCTS, GET_ORDERS, GET_USER_BY_EMAIL } from "@/graphql/queries";
import { CREATE_ORDER, CREATE_PRODUCT, CREATE_USER } from "@/graphql/mutations";

export default function OrdersPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <OrdersPageContent user={user} />;
}

function OrdersPageContent({ user }: { user: any }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch products and orders using GraphQL
  const {
    data: productsData,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useQuery(GET_PRODUCTS) as any;
  const {
    data: ordersData,
    loading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery(GET_ORDERS) as any;
  const [createOrderMutation, { loading: isCreating }] =
    useMutation(CREATE_ORDER) as any;
  const [createProductMutation] = useMutation(CREATE_PRODUCT) as any;
  const [createUserMutation, { loading: isCreatingCustomer }] =
    useMutation(CREATE_USER) as any;
  const [getUserByEmail, { loading: isFetchingUser }] =
    useLazyQuery(GET_USER_BY_EMAIL) as any;

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];
  const isLoading = productsLoading || ordersLoading;

  // Form States
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New product form state
  const [newProductForm, setNewProductForm] = useState({
    product_name: "",
    product_code: "",
    description: "",
    make: "",
    model: "",
    year: "",
    price: 50.0,
  });
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query);
  };

  const handleNewProductFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchByVehicle = () => {
    const { make, model, year } = newProductForm;
    if (!make || !model || !year) {
      alert("Please fill in Make, Model, and Year");
      return;
    }

    // Search for matching products
    const matchingProducts = products.filter(
      (p: Product) =>
        p.make.toLowerCase().includes(make.toLowerCase()) &&
        p.model.toLowerCase().includes(model.toLowerCase()) &&
        p.year.toLowerCase().includes(year.toLowerCase()),
    );

    if (matchingProducts.length > 0) {
      // Show search results
      setSearchQuery(`${make} ${model} ${year}`);
      setIsSearching(true);
    } else {
      // No matches, show form to add new product
      setShowNewProductForm(true);
    }
  };

  const handleCreateAndAddProduct = async () => {
    const {
      product_name,
      product_code,
      description,
      make,
      model,
      year,
      price,
    } = newProductForm;

    if (!product_name || !product_code || !make || !model || !year) {
      const missing = [];
      if (!product_name) missing.push('Product Name');
      if (!product_code) missing.push('Product Code');
      if (!make) missing.push('Make');
      if (!model) missing.push('Model');
      if (!year) missing.push('Year');
      alert(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }

    try {
      const { data } = await createProductMutation({
        variables: {
          product_name,
          product_code,
          description,
          make,
          model,
          year,
        },
      });

      if (data?.createProduct) {
        // Add the new product to selected products
        const newOrderProduct: OrderProduct = {
          ...data.createProduct,
          quantity: 1,
          price,
        };
        setSelectedProducts((prev) => [...prev, newOrderProduct]);

        // Reset form
        setNewProductForm({
          product_name: "",
          product_code: "",
          description: "",
          make: "",
          model: "",
          year: "",
          price: 50.0,
        });
        setShowNewProductForm(false);

        // Refresh products list
        await refetchProducts();

        alert("Product created and added to order!");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(`Failed to create product: ${error.message || 'Please try again'}`);
    }
  };

  const addProduct = (product: Product) => {
    const newOrderProduct: OrderProduct = {
      ...product,
      quantity: 1,
      price: product.price || 50.0,
    };

    const exists = selectedProducts.find(
      (p) => p.product_id === product.product_id,
    );
    if (exists) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.product_id === product.product_id
            ? { ...p, quantity: p.quantity + 1 }
            : p,
        ),
      );
    } else {
      setSelectedProducts((prev) => [...prev, newOrderProduct]);
    }
    setSearchQuery("");
    setIsSearching(false);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.product_id !== productId),
    );
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.product_id === productId) {
          const newQty = Math.max(1, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      }),
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0,
    );
  };

  const handleAddCustomer = async () => {
    // Validate customer fields
    if (!formData.firstname || !formData.lastname || !formData.email) {
      alert("Please fill in at least firstname, lastname, and email");
      return;
    }

    try {
      const { data } = await createUserMutation({
        variables: {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          role: "customer",
        },
      });

      if (data?.createUser) {
        alert(
          `Customer ${data.createUser.firstname} ${data.createUser.lastname} added successfully!`,
        );
      }
    } catch (error: any) {
      alert(`Failed to add customer: ${error.message}`);
      console.error("Add customer error:", error);
    }
  };

  const handleFetchUser = async () => {
    if (!formData.email) {
      alert("Please enter an email address");
      return;
    }

    try {
      const { data } = await getUserByEmail({
        variables: { email: formData.email },
      });

      if (data?.userByEmail) {
        const user = data.userByEmail;
        setFormData((prev) => ({
          ...prev,
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
        }));
        alert(`User found: ${user.firstname} ${user.lastname}`);
      } else {
        alert("No user found with this email");
      }
    } catch (error: any) {
      alert(`Failed to fetch user: ${error.message}`);
      console.error("Fetch user error:", error);
    }
  };

  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0) {
      alert("Please add at least one product");
      return;
    }

    // Validate form
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.phone
    ) {
      alert("Please fill in all customer information fields");
      return;
    }

    const customer_name = `${formData.firstname} ${formData.lastname}`;
    const shipping_address = `${formData.address}, ${formData.city}, ${formData.state}`;

    // Format products for GraphQL
    const productInputs = selectedProducts.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      product_code: p.product_code,
      make: p.make,
      model: p.model,
      year: p.year,
      quantity: p.quantity,
      price: p.price,
    }));

    try {
      const { data } = await createOrderMutation({
        variables: {
          customer_name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address,
          total_amount: calculateTotal(),
          products: productInputs,
        },
      });

      if (data?.createOrder) {
        // Order created successfully
        alert("Order created successfully!");

        // Ask if user wants to pay now or later
        const payNow = confirm(
          "Order created! Would you like to proceed with payment now?",
        );

        if (payNow) {
          // Store order data for payment
          const orderForPayment = {
            order_id: data.createOrder.order_id,
            customer_name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: shipping_address,
            total_amount: calculateTotal(),
            products: productInputs,
          };
          sessionStorage.setItem(
            "pendingOrder",
            JSON.stringify(orderForPayment),
          );
          router.push("/payment");
        } else {
          // Refresh orders list
          refetchOrders();
          // Reset form
          setFormData({
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
          });
          setSelectedProducts([]);
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  // Handle payment for existing order
  const handlePayForOrder = async (order: any) => {
    // Prepare order data for payment (order already has all needed data from GraphQL)
    try {
      const orderData = {
        order_id: order.order_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        customer_address: order.shipping_address || "",
        total_amount: order.total_amount,
        products: order.orderProducts || [],
      };

      // Store in sessionStorage and redirect to payment
      sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
      router.push("/payment");
    } catch (error) {
      console.error("Error preparing order for payment:", error);
      alert("Failed to load order details");
    }
  };

  // Filter products based on search (including vehicle info)
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p: Product) =>
        p.product_name.toLowerCase().includes(query) ||
        p.product_code.toLowerCase().includes(query) ||
        p.make.toLowerCase().includes(query) ||
        p.model.toLowerCase().includes(query) ||
        p.year.toLowerCase().includes(query) ||
        `${p.make} ${p.model} ${p.year}`.toLowerCase().includes(query),
    );
  }, [searchQuery, products]);

  return (
    <div className="flex bg-gray-50 font-sans text-gray-800 mt-6" style={{ height: 'calc(100vh - 96px)' }}>
      {/* --- Sidebar --- */}
      <aside
        className={`${
          isSidebarOpen ? "w-72" : "w-16"
        } bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl relative z-20`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-blue-600 rounded-full p-1 text-white shadow-lg hover:bg-blue-500 transition-colors border-2 border-slate-900"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-center h-16">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold tracking-wider text-blue-400">
              SalesFlow
            </h2>
          ) : (
            <Package size={24} className="text-blue-400" />
          )}
        </div>

        {/* Recent Orders List */}
        <div className="flex-1 overflow-y-auto py-4">
          {isSidebarOpen && (
            <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Orders
            </div>
          )}

          <div className="space-y-1">
            {isLoading ? (
              <div className="text-center text-slate-400 py-8">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                No orders yet
              </div>
            ) : (
              orders.map((order: any) => (
                <div
                  key={order.order_id}
                  onClick={() => {
                    if (order.payment_status === "unpaid") {
                      handlePayForOrder(order);
                    }
                  }}
                  className={`flex items-center px-4 py-3 hover:bg-slate-800 transition-colors ${!isSidebarOpen && "justify-center"} ${
                    order.payment_status === "unpaid"
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                  title={order.payment_status === "unpaid" ? "Click to pay" : ""}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${
                      order.payment_status === "unpaid"
                        ? "bg-yellow-400"
                        : order.payment_status === "paid"
                          ? "bg-green-400"
                          : order.payment_status === "partial"
                            ? "bg-orange-400"
                            : "bg-gray-400"
                    }`}
                  />

                  {isSidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-200">
                        {order.customer_name}
                      </p>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{order.order_id.slice(0, 12)}</span>
                        <span className="flex items-center gap-1">
                          ${order.total_amount}
                          {order.payment_status === "unpaid" && (
                            <span className="text-yellow-400 text-[10px]">
                              • Unpaid
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="text-blue-600" /> New Order
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Sales Agent:{" "}
              <span className="font-semibold">
                {user?.firstName} {user?.lastName}
              </span>
            </span>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={isCreating || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {isCreating ? "Creating..." : "Create Order"}
            </button>
          </div>
        </header>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* 1. Customer Information */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Customer Information
                  </h3>
                </div>
                <button
                  onClick={handleAddCustomer}
                  disabled={isCreatingCustomer}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} />
                  {isCreatingCustomer ? "Adding..." : "Add Customer"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />

                {/* Email field with fetch button */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={handleFetchUser}
                      disabled={isFetchingUser || !formData.email}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isFetchingUser ? "Fetching..." : "Fetch"}
                    </button>
                  </div>
                </div>

                <InputField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </section>

            {/* 2. Products Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                <ShoppingCart className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                  Products
                </h3>
              </div>

              {/* Vehicle-Based Product Search */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Find Product by Vehicle
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    name="make"
                    placeholder="Make (e.g., Toyota)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newProductForm.make}
                    onChange={handleNewProductFormChange}
                  />
                  <input
                    type="text"
                    name="model"
                    placeholder="Model (e.g., Camry)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newProductForm.model}
                    onChange={handleNewProductFormChange}
                  />
                  <input
                    type="text"
                    name="year"
                    placeholder="Year (e.g., 2020)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newProductForm.year}
                    onChange={handleNewProductFormChange}
                  />
                  <button
                    onClick={handleSearchByVehicle}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Search size={16} /> Search
                  </button>
                </div>
              </div>

              {/* New Product Form (shown when no match found) */}
              {showNewProductForm && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      No matching product found - Add New Product
                    </h4>
                    <button
                      onClick={() => setShowNewProductForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="product_name"
                      placeholder="Product Name *"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newProductForm.product_name}
                      onChange={handleNewProductFormChange}
                      required
                    />
                    <input
                      type="text"
                      name="product_code"
                      placeholder="Product Code *"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newProductForm.product_code}
                      onChange={handleNewProductFormChange}
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Description (optional)"
                      className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newProductForm.description}
                      onChange={handleNewProductFormChange}
                      rows={2}
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price *"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      value={newProductForm.price}
                      onChange={handleNewProductFormChange}
                      required
                      step="0.01"
                    />
                    <button
                      onClick={handleCreateAndAddProduct}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={16} /> Add Product
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Search Bar */}
              <div className="relative mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Or search products manually by name or code..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => handleProductSearch(e.target.value)}
                  />
                </div>

                {/* Search Results Dropdown */}
                {isSearching && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {filteredProducts.map((product: Product) => (
                      <div
                        key={product.product_id}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0"
                        onClick={() => addProduct(product)}
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {product.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.product_code} • {product.make}{" "}
                            {product.model} {product.year}
                          </div>
                        </div>
                        <Plus size={16} className="text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {isSearching && filteredProducts.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
                    No products found
                  </div>
                )}
              </div>

              {/* Selected Products Table */}
              {selectedProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Product Info</th>
                        <th className="px-4 py-3 text-center">Vehicle</th>
                        <th className="px-4 py-3 text-center">Price</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedProducts.map((item) => (
                        <tr key={item.product_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.product_code}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {item.make} {item.model} {item.year}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product_id, -1)
                                }
                                className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 min-w-[30px] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product_id, 1)
                                }
                                className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeProduct(item.product_id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-right font-bold text-gray-600"
                        >
                          Total Amount:
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-xl text-blue-600">
                          ${calculateTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                  Search and add products to this order
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField = ({
  label,
  required,
  className,
  ...props
}: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 ${className}`}
      {...props}
    />
  </div>
);
