import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import isAuth from "../../../Middleware/isAuth";
import DateFormat from "../../../utils/DateFormat";
import apiRequest from "../../../utils/apiRequest";
import auth from "../../../utils/auth";
import languageModel from "../../../utils/languageModel";
import settings from "../../../utils/settings";
import wordCount from "../../../utils/wordCount";
import { fetchCart } from "../../store/Cart";
import EmptyCardError from "../EmptyCardError";
import InputCom from "../Helpers/InputCom";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import PageTitle from "../Helpers/PageTitle";
import Selectbox from "../Helpers/Selectbox";
import CheckProductIsExistsInFlashSale from "../Shared/CheckProductIsExistsInFlashSale";

function CheakoutPage() {
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const { currency_icon } = settings();
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const [carts, setCarts] = useState(null);
  const [totalWeight, setTotalWeight] = useState(null);
  const [totalQty, setQty] = useState(null);
  const [fName, setFname] = useState("");
  const [lName, setlname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [home, setHome] = useState(true);
  const [office, setOffice] = useState(false);
  const [countryDropdown, setCountryDropdown] = useState(null);
  const [country, setCountry] = useState(null);
  const [stateDropdown, setStateDropdown] = useState(null);
  const [state, setState] = useState(null);
  const [cityDropdown, setCityDropdown] = useState(null);
  const [city, setcity] = useState(null);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState(null);
  const [activeAddress, setActiveAddress] = useState("billing");
  const [newAddress, setNewAddress] = useState(false);
  const [selectedShipping, setShipping] = useState(null);
  const [selectedBilling, setBilling] = useState(null);
  const [subTotal, setSubTotal] = useState(null);
  const [shippingRules, setShipppingRules] = useState(null);
  const [shippingRulesByCityId, setShippingRulesByCityId] = useState([]);
  const [selectPayment, setPaymentMethod] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(null);
  const [strpeNumber, setStrpeNumber] = useState("");
  const [expireDate, setExpireDate] = useState(null);
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setHolderName] = useState("");
  const [stripeError, setStrpError] = useState(null);
  const [strpLoad, setStrpLoading] = useState(false);
  const [inputCoupon, setInputCoupon] = useState("");
  const [couponCode, setCouponCode] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [discountCoupon, setDiscountCoupon] = useState(0);
  useEffect(() => {
    if (couponCode) {
      if (couponCode.offer_type === "2") {
        let price = totalPrice - parseInt(couponCode.discount);
        setDiscountCoupon(totalPrice - price);
      } else {
        let price =
          (parseInt(couponCode.discount) / 100) * parseInt(totalPrice);
        setDiscountCoupon(price);
      }
    }
  }, [couponCode, totalPrice]);

  const [transactionInfo, setTransactionInfo] = useState("");
  const [langCntnt, setLangCntnt] = useState(null);
  useEffect(() => {
    setLangCntnt(languageModel());
  }, []);
  //bank status
  const [cashOnDeliveryStatus, setCashOnDeliveryStatus] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [rezorPayStatue, setRezorPay] = useState(null);
  const [flutterWaveStatus, setFlutterWaveStatus] = useState(null);
  const [mollieStatus, setMollieStatus] = useState(null);
  const [instaMojoStatus, setInstaMojoStatus] = useState(null);
  const [payStackStatus, setPayStackStatus] = useState(null);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [bankPaymentStatus, setBankPaymentStatus] = useState(null);
  const [sslStatus, setSslStatus] = useState(null);
  const submitCoupon = () => {
    if (auth()) {
      apiRequest
        .applyCoupon(auth().access_token, inputCoupon)
        .then((res) => {
          setInputCoupon("");
          if (res.data) {
            if (totalPrice >= parseInt(res.data.coupon.min_purchase_price)) {
              setCouponCode(res.data.coupon);
              localStorage.setItem(
                "coupon",
                JSON.stringify(res.data && res.data.coupon)
              );
              let currDate = new Date().toLocaleDateString();
              localStorage.setItem("coupon_set_date", currDate);

              toast.success(langCntnt && langCntnt.Coupon_Applied);
            } else {
              toast.error(
                langCntnt && langCntnt.Your_total_price_not_able_to_apply_coupon
              );
            }
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response && err.response.data.message);
        });
    } else {
      return false;
    }
  };
  const dateHandler = (e) => {
    setExpireDate({
      value: e.target.value,
      formated: DateFormat(e.target.value, false),
    });
  };
  const getAllAddress = () => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/user/checkout?token=${auth().access_token
        }`
      )
      .then((res) => {
        setSslStatus(
          !!(
            res.data &&
            res.data.sslcommerz &&
            parseInt(res.data.sslcommerz.status) === 1
          )
        );
        setPaypalStatus(
          !!(
            res.data &&
            res.data.paypalPaymentInfo &&
            parseInt(res.data.paypalPaymentInfo.status) === 1
          )
        );
        setPayStackStatus(
          !!(
            res.data &&
            res.data.paystackAndMollie &&
            parseInt(res.data.paystackAndMollie.paystack_status) === 1
          )
        );
        setInstaMojoStatus(
          !!(
            res.data &&
            res.data.instamojo &&
            parseInt(res.data.instamojo.status) === 1
          )
        );
        setMollieStatus(
          !!(
            res.data &&
            res.data.paystackAndMollie &&
            parseInt(res.data.paystackAndMollie.mollie_status) === 1
          )
        );
        setFlutterWaveStatus(
          !!(
            res.data &&
            res.data.flutterwavePaymentInfo &&
            parseInt(res.data.flutterwavePaymentInfo.status) === 1
          )
        );
        setRezorPay(
          !!(
            res.data &&
            res.data.razorpayPaymentInfo &&
            parseInt(res.data.razorpayPaymentInfo.status) === 1
          )
        );
        setStripeStatus(
          !!(
            res.data &&
            res.data.stripePaymentInfo &&
            parseInt(res.data.stripePaymentInfo.status) === 1
          )
        );
        setCashOnDeliveryStatus(
          !!(
            res.data &&
            res.data.bankPaymentInfo &&
            parseInt(res.data.bankPaymentInfo.cash_on_delivery_status) === 1
          )
        );
        setBankPaymentStatus(
          !!(
            res.data &&
            res.data.bankPaymentInfo &&
            parseInt(res.data.bankPaymentInfo.status) === 1
          )
        );
        setBankInfo(
          res.data && res.data.bankPaymentInfo && res.data.bankPaymentInfo
        );
        setShipppingRules(res.data && res.data.shippings);
        setShippingRulesByCityId(() => {
          const getShippingById =
            res.data &&
            res.data.shippings.length > 0 &&
            res.data.shippings.filter((s) => parseInt(s.city_id) === 0);
          return getShippingById;
        });
        res.data && setAddresses(res.data.addresses);
        setShipping(res.data && res.data.addresses[0].id);
        setBilling(res.data && res.data.addresses[0].id);

        const cp = localStorage.getItem("coupon");
        if (cp) {
          let crrDate = new Date().toLocaleDateString();
          let storeDate = localStorage.getItem("coupon_set_date");
          if (crrDate === storeDate) {
            let dataK = JSON.parse(cp);
            setCouponCode(dataK);
          } else {
            localStorage.removeItem("coupon_set_date");
            localStorage.removeItem("coupon");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (auth()) {
      getAllAddress();
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/user/address/create?token=${auth().access_token
          }`
        )
        .then((res) => {
          if (res.data) {
            setCountryDropdown(res.data.countries);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);
  const getState = (value) => {
    if (auth() && value) {
      setCountry(value.id);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/user/state-by-country/${value.id
          }?token=${auth().access_token}`
        )
        .then((res) => {
          setCityDropdown(null);
          setStateDropdown(res.data && res.data.states);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return false;
    }
  };
  const getcity = (value) => {
    if (auth() && value) {
      setState(value.id);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/user/city-by-state/${value.id
          }?token=${auth().access_token}`
        )
        .then((res) => {
          setCityDropdown(res.data && res.data.cities);
        })
        .catch((err) => {
          console.log(err.response);
        });
    } else {
      return false;
    }
  };
  const selectCity = (value) => {
    if (auth() && value) {
      setcity(value.id);
    }
  };
  const saveAddress = async () => {
    setLoading(true);
    if (auth()) {
      apiRequest
        .saveAddress(auth().access_token, {
          name: fName && lName ? fName + " " + lName : null,
          email: email,
          phone: phone,
          address: address,
          type: home ? home : office ? office : null,
          country: country,
          state: state,
          city: city,
        })
        .then((res) => {
          setLoading(false);
          setFname("");
          setlname("");
          setEmail("");
          setPhone("");
          setAddress("");
          setCountryDropdown(null);
          setStateDropdown(null);
          setCityDropdown(null);
          setErrors(null);
          getAllAddress();
          setNewAddress(false);
          toast.success(res.data && res.data.notification, {
            autoClose: 1000,
          });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          err.response && setErrors(err.response.data.errors);
        });
    } else {
      return false;
    }
  };
  // parseInt(item.qty)
  useEffect(() => {
    setCarts(cart && cart.cartProducts);

    //total weight
    const ttwList =
      cart &&
      cart.cartProducts.length > 0 &&
      cart.cartProducts.map(
        (item) => parseInt(item.product.weight) * parseInt(item.qty)
      );
    const ttw =
      ttwList &&
      ttwList.length > 0 &&
      ttwList.reduce((prev, curr) => parseInt(prev) + parseInt(curr), 0);
    setTotalWeight(ttw && ttw);
    //total qty
    const tqList =
      cart &&
      cart.cartProducts.length > 0 &&
      cart.cartProducts.map((item) => parseInt(item.qty));
    const tq =
      tqList &&
      tqList.length > 0 &&
      tqList.reduce((prev, curr) => parseInt(prev) + parseInt(curr), 0);
    setQty(tq && tq);
  }, [cart]);
  const checkProductExistsInFlashSale = (id, price) => {
    if (websiteSetup) {
      const flashSaleOffer =
        websiteSetup.payload.flashSale && websiteSetup.payload.flashSale.offer;
      const flashSaleIds =
        websiteSetup.payload.flashSaleProducts.length > 0 &&
        websiteSetup.payload.flashSaleProducts.find(
          (item) => parseInt(item.product_id) === parseInt(id)
        );
      if (flashSaleOffer && flashSaleIds) {
        const offer = parseInt(flashSaleOffer);
        const discountPrice = (offer / 100) * parseFloat(price); //confusion
        const mainPrice = parseFloat(price) - discountPrice;
        return mainPrice;
      } else {
        return price;
      }
    }
  };
  const totalPrice = subTotal && subTotal.reduce((prev, curr) => prev + curr);
  useEffect(() => {
    if (carts && carts.length > 0) {
      setSubTotal(
        carts.map((v) => {
          let prices = [];
          v.variants.map(
            (item) =>
              item.variant_item &&
              prices.push(parseInt(item.variant_item.price))
          );
          const sumCal = prices.length > 0 && prices.reduce((p, c) => p + c);
          if (v.product.offer_price) {
            if (v.variants && v.variants.length > 0) {
              const v_price = sumCal + parseInt(v.product.offer_price);

              const checkFlshPrdct = checkProductExistsInFlashSale(
                v.product_id,
                v_price
              );
              return checkFlshPrdct * v.qty;
              // return checkProductExistsInFlashSale(v.product_id, v_price);
            } else {
              const wo_v_price = checkProductExistsInFlashSale(
                v.product_id,
                parseInt(v.product.offer_price)
              );
              return wo_v_price * v.qty;
            }
          } else {
            if (v.variants && v.variants.length > 0) {
              const v_price = sumCal + parseInt(v.product.price);
              const checkFlshPrdct = checkProductExistsInFlashSale(
                v.product_id,
                v_price
              );
              return checkFlshPrdct * v.qty;
            } else {
              const wo_v_price = checkProductExistsInFlashSale(
                v.product_id,
                parseInt(v.product.price)
              );
              return wo_v_price * v.qty;
            }
          }
        })
      );
    }
  }, [carts]);
  const [mainTotalPrice, setMainTotalPrice] = useState(null);
  useEffect(() => {
    if (shippingCharge) {
      setMainTotalPrice((totalPrice + parseFloat(shippingCharge)).toFixed(2));
    } else {
      setMainTotalPrice(parseFloat(totalPrice).toFixed(2));
    }
  });
  const price = (item) => {
    if (item) {
      if (item.product.offer_price) {
        if (item.variants && item.variants.length > 0) {
          const prices = item.variants.map((item) =>
            item.variant_item ? parseInt(item.variant_item.price) : 0
          );
          const sumVarient = prices.reduce((p, c) => p + c);
          return (parseInt(item.product.offer_price) + sumVarient) * item.qty;
        } else {
          return parseInt(item.product.offer_price) * item.qty;
        }
      } else {
        if (item.variants && item.variants.length > 0) {
          const prices = item.variants.map((item) =>
            item.variant_item ? parseInt(item.variant_item.price) : 0
          );
          const sumVarient = prices.reduce((p, c) => p + c);
          const sum = parseInt(item.product.price) + parseInt(sumVarient);
          return sum * parseInt(item.qty);
        } else {
          return item.product.price * item.qty;
        }
      }
    }
  };
  const shippingHandler = (addressId, cityId) => {
    setShipping(addressId);
    const getRules =
      shippingRules &&
      shippingRules.filter((f) => parseInt(f.city_id) === cityId);
    const defaultRule = shippingRules.filter(
      (item) => parseInt(item.city_id) === 0
    );
    if (getRules && getRules.length > 0) {
      const isIncluded = shippingRulesByCityId.some((value) =>
        getRules.includes(value)
      );
      if (isIncluded) {
        return setShippingRulesByCityId([...defaultRule, ...getRules]);
      } else {
        if (shippingRulesByCityId.length > 0) {
          setShippingRulesByCityId([...defaultRule, ...getRules]);
        } else {
          setShippingRulesByCityId((prev) => [...prev, ...getRules]);
        }
      }
    } else {
      const defaultRule = shippingRules.filter(
        (item) => parseInt(item.city_id) === 0
      );
      setShippingRulesByCityId(defaultRule);
    }
  };
  useEffect(() => {
    if (
      addresses &&
      addresses.length > 0 &&
      shippingRules &&
      shippingRules.length > 0
    ) {
      shippingHandler(
        parseInt(addresses[0].id),
        parseInt(addresses[0].city_id)
      );
    }
  }, [shippingRules, addresses]);

  const selectedRuleHandler = (e, price) => {
    setSelectedRule(e.target.value);
    setShippingCharge(price);
  };
  //delete address
  const deleteAddress = (id) => {
    if (auth()) {
      apiRequest
        .deleteAddress(id, auth().access_token)
        .then((res) => {
          toast.success(res.data && res.data.notification);
          getAllAddress();
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response && err.response.data.notification);
        });
    }
  };
  const placeOrderHandler = async () => {
    if (auth()) {
      if (selectedBilling && selectedShipping) {
        if (selectedRule) {
          if (selectPayment) {
            if (selectPayment && selectPayment === "cashOnDelivery") {
              await apiRequest
                .cashOnDelivery(
                  {
                    shipping_address_id: selectedShipping,
                    billing_address_id: selectedBilling,
                    shipping_method_id: parseInt(selectedRule),
                    coupon: couponCode && couponCode.code,
                  },
                  auth().access_token
                )
                .then((res) => {
                  if (res.data) {
                    toast.success(res.data.message);
                    router.push(`/order/${res.data.order_id}`);
                    dispatch(fetchCart());
                    localStorage.removeItem("coupon_set_date");
                    localStorage.removeItem("coupon");
                  }
                })
                .catch((err) => {
                  console.log(err);
                  toast.success(err.response && err.response.message);
                });
            } else if (selectPayment && selectPayment === "stripe") {
              setStrpLoading(true);
              await apiRequest
                .stipePay(
                  {
                    agree_terms_condition: 1,
                    card_number: strpeNumber,
                    year: expireDate && expireDate.formated.year,
                    month: expireDate && expireDate.formated.month,
                    cvv: cvv,
                    card_holder_name: cardHolderName,
                    shipping_address_id: selectedShipping,
                    billing_address_id: selectedBilling,
                    shipping_method_id: parseInt(selectedRule),
                    coupon: couponCode && couponCode.code,
                  },
                  auth().access_token
                )
                .then((res) => {
                  toast.success(res.data && res.data.message);
                  router.push(`/order/${res.data.order_id}`);
                  console.log(res);
                  dispatch(fetchCart());
                  setStrpError(null);
                  setHolderName("");
                  setExpireDate(null);
                  setCvv("");
                  setStrpeNumber("");
                  setPaymentMethod("");
                  setStrpLoading(false);
                  localStorage.removeItem("coupon_set_date");
                  localStorage.removeItem("coupon");
                })
                .catch((err) => {
                  setStrpLoading(false);
                  setStrpError(err.response && err.response.data.errors);
                  console.error(err);
                });
            } else if (selectPayment && selectPayment === "paypal") {
              setStrpLoading(true);
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/paypal-react-web-view?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;
              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else if (selectPayment && selectPayment === "razorpay") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/razorpay-order?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}`;
              await axios
                .get(url)
                .then((res) => {
                  const order_id = res.data && res.data.order_id;
                  const amount = res.data && res.data.amount;
                  if (res.data) {
                    const provideUrl = `${process.env.NEXT_PUBLIC_BASE_URL
                      }user/checkout/razorpay-web-view?token=${auth().access_token
                      }&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                      }&billing_address_id=${selectedBilling}&shipping_method_id=${parseInt(
                        selectedRule
                      )}&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                        ? window.location.origin + "/order/"
                        : ""
                      }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                        ? window.location.origin + "/payment-faild"
                        : ""
                      }&request_from=react_web&amount=${amount}&order_id=${order_id}`;
                    router.push(provideUrl);
                    localStorage.removeItem("coupon_set_date");
                    localStorage.removeItem("coupon");
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else if (selectPayment && selectPayment === "flutterWave") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/flutterwave-web-view?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&request_from=react_web&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;
              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else if (selectPayment && selectPayment === "mollie") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/pay-with-mollie?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&request_from=react_web&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;
              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else if (selectPayment && selectPayment === "instamojo") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/pay-with-instamojo?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&request_from=react_web&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;
              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else if (selectPayment && selectPayment === "paystack") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/paystack-web-view?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&request_from=react_web&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;
              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else if (selectPayment && selectPayment === "bankpayment") {
              await apiRequest
                .bankPayment(
                  {
                    shipping_address_id: selectedShipping,
                    billing_address_id: selectedBilling,
                    shipping_method_id: parseInt(selectedRule),
                    tnx_info: transactionInfo,
                    coupon: couponCode && couponCode.code,
                  },
                  auth().access_token
                )
                .then((res) => {
                  if (res.data) {
                    toast.success(res.data.message);
                    router.push(`/order/${res.data.order_id}`);
                    dispatch(fetchCart());
                    localStorage.removeItem("coupon_set_date");
                    localStorage.removeItem("coupon");
                  }
                })
                .catch((err) => {
                  console.log(err);
                  toast.success(err.response && err.response.message);
                });
            } else if (selectPayment && selectPayment === "sslcommerce") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/sslcommerz-web-view?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&request_from=react_web&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;

              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else {
              toast.error(langCntnt && langCntnt.Select_your_payment_system);
            }
          } else {
            toast.error(
              langCntnt && langCntnt.Please_Select_Your_Payment_Method
            );
          }
        } else {
          toast.error(langCntnt && langCntnt.Please_Select_Shipping_Rule);
        }
      }
    }
  };

  if (carts && carts.length > 0) {
    return (
      <div className="checkout-page-wrapper w-full bg-white pb-[120px]">
        <div className="w-full mb-5">
          <PageTitle
            title={langCntnt && langCntnt.checkout}
            breadcrumb={[
              { name: langCntnt && langCntnt.home, path: "/" },
              { name: langCntnt && langCntnt.checkout, path: "/checkout" },
            ]}
          />
        </div>
        <div className="checkout-main-content w-full">
          <div className="container-x mx-auto ">
            <div className="w-full lg:flex lg:space-x-[30px]">
              <div className="lg:w-4/6 w-full">
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                  {langCntnt && langCntnt.Addresses}
                </h1>
                {!newAddress && (
                  <div className="addresses-widget w-full">
                    <div className="sm:flex justify-between items-center w-full mb-5">
                      <div className="bg-qpurplelow/10 border border-qpurple rounded p-2">
                        <button
                          onClick={() => setActiveAddress("billing")}
                          type="button"
                          className={`px-4 py-3 text-md font-medium rounded-md  ${activeAddress === "billing"
                            ? "text-white bg-qpurple"
                            : "text-qpurple"
                            } `}
                        >
                          {langCntnt && langCntnt.Billing_Address}
                        </button>
                        <button
                          onClick={() => setActiveAddress("shipping")}
                          type="button"
                          className={`px-4 py-3 text-md font-medium rounded-md ml-1 ${activeAddress === "shipping"
                            ? "text-white bg-qpurple"
                            : "text-qpurple"
                            } `}
                        >
                          {langCntnt && langCntnt.Shipping_Address}
                        </button>
                      </div>

                      <button
                        onClick={() => setNewAddress(!newAddress)}
                        type="button"
                        className="w-[100px] h-[40px] mt-2 sm:mt-0 border rounded-full text-qblack hover:bg-qblack hover:text-white bg-qyellow transition-all duration-300 ease-in-out"
                      >
                        <span className="text-sm font-semibold ">
                          {langCntnt && langCntnt.Add_New}
                        </span>
                      </button>
                    </div>
                    {activeAddress === "billing" ? (
                      <div
                        data-aos="zoom-in"
                        className="grid sm:grid-cols-2 grid-cols-1 gap-3"
                      >
                        {addresses &&
                          addresses.length > 0 &&
                          addresses.map((address, i) => (
                            <div
                              onClick={() => setBilling(address.id)}
                              key={i}
                              className={`w-full p-5 border cursor-pointer relative rounded ${address.id === selectedBilling
                                ? "border-qpurple bg-qpurplelow/10"
                                : "border-transparent bg-primarygray"
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <p className="title text-[22px] font-semibold">
                                  {langCntnt && langCntnt.Address} #{i + 1}
                                </p>
                                <button
                                  onClick={() => deleteAddress(address.id)}
                                  type="button"
                                  className="bg-white shadow group w-[34px] h-[34px] rounded-full flex justify-center items-center"
                                >
                                  <svg
                                    width="17"
                                    height="25"
                                    viewBox="0 0 17 19"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M15.7768 5.95215C15.6991 6.9104 15.6242 7.84603 15.5471 8.78237C15.3691 10.9285 15.1917 13.0747 15.0108 15.2209C14.9493 15.9473 14.9097 16.6773 14.8065 17.3988C14.6963 18.1726 14.0716 18.7161 13.2929 18.7196C10.3842 18.7323 7.47624 18.7337 4.56757 18.7189C3.70473 18.7146 3.08639 18.0794 3.00795 17.155C2.78181 14.493 2.57052 11.8302 2.35145 9.16821C2.2716 8.19442 2.1875 7.22133 2.10623 6.24824C2.09846 6.15638 2.09563 6.06451 2.08998 5.95286C6.65579 5.95215 11.2061 5.95215 15.7768 5.95215ZM5.25375 8.05803C5.25234 8.05803 5.25163 8.05803 5.25022 8.05803C5.27566 8.4573 5.3011 8.85657 5.32583 9.25584C5.46717 11.5228 5.60709 13.7891 5.75125 16.0561C5.77245 16.3897 5.99081 16.6038 6.28196 16.6024C6.58724 16.601 6.80066 16.3636 6.8056 16.0159C6.80702 15.9339 6.80136 15.8512 6.79571 15.7692C6.65367 13.4789 6.51304 11.1886 6.36888 8.89826C6.33849 8.41702 6.31164 7.93507 6.26146 7.45524C6.22966 7.1549 6.0318 6.99732 5.73076 6.99802C5.44526 6.99873 5.24033 7.2185 5.23043 7.52873C5.22619 7.7054 5.24598 7.88207 5.25375 8.05803ZM12.6102 8.05521C12.6088 8.05521 12.6074 8.05521 12.606 8.05521C12.6152 7.89055 12.6321 7.7259 12.6307 7.56195C12.6286 7.24465 12.4399 7.02417 12.1622 6.99873C11.888 6.97329 11.6484 7.16268 11.5961 7.46443C11.5665 7.63756 11.5615 7.81494 11.5502 7.9909C11.4626 9.38799 11.3749 10.7851 11.2887 12.1822C11.2103 13.4499 11.1276 14.7184 11.0576 15.9869C11.0379 16.3431 11.2463 16.5819 11.5495 16.6003C11.8562 16.6194 12.088 16.4017 12.1099 16.0505C12.2788 13.3856 12.4441 10.7208 12.6102 8.05521ZM9.45916 11.814C9.45916 10.4727 9.45986 9.13147 9.45916 7.79091C9.45916 7.25101 9.28603 6.99449 8.92845 6.99661C8.56805 6.99802 8.40198 7.24819 8.40198 7.79586C8.40127 10.4664 8.40127 13.1369 8.40268 15.8074C8.40268 15.948 8.37088 16.1289 8.44296 16.2194C8.56946 16.3763 8.76591 16.5748 8.93198 16.5741C9.09805 16.5734 9.29309 16.3727 9.41746 16.2151C9.48955 16.124 9.45704 15.9431 9.45704 15.8032C9.46057 14.4725 9.45916 13.1432 9.45916 11.814Z"
                                      fill="#EB5757"
                                    />
                                    <path
                                      className={`transform rotate-0 group-hover:-rotate-[10deg] transition duration-300 ease-in-out`}
                                      d="M5.20143 2.75031C5.21486 2.49449 5.21839 2.2945 5.23747 2.09593C5.31733 1.25923 5.93496 0.648664 6.77449 0.637357C8.21115 0.618277 9.64923 0.618277 11.0859 0.637357C11.9254 0.648664 12.5438 1.25852 12.6236 2.09522C12.6427 2.2938 12.6462 2.49379 12.6582 2.73335C12.7854 2.739 12.9084 2.74889 13.0314 2.7496C13.9267 2.75101 14.8221 2.74677 15.7174 2.75172C16.4086 2.75525 16.8757 3.18774 16.875 3.81244C16.8742 4.43643 16.4078 4.87103 15.716 4.87174C11.1926 4.87386 6.66849 4.87386 2.14508 4.87174C1.45324 4.87103 0.986135 4.43713 0.985429 3.81314C0.984722 3.18915 1.45183 2.75525 2.14296 2.75243C3.15421 2.74677 4.16545 2.75031 5.20143 2.75031ZM11.5799 2.73335C11.5799 2.59625 11.5806 2.49096 11.5799 2.38637C11.5749 1.86626 11.4018 1.69313 10.876 1.69242C9.55878 1.69101 8.24225 1.68959 6.92501 1.69313C6.48546 1.69454 6.30031 1.87545 6.28265 2.3051C6.27699 2.4422 6.28194 2.58 6.28194 2.73335C8.05851 2.73335 9.7941 2.73335 11.5799 2.73335Z"
                                      fill="#EB5757"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="mt-5">
                                <table>
                                  <tbody>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <div>
                                          {langCntnt && langCntnt.Name}:
                                        </div>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.name}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <div>
                                          {langCntnt && langCntnt.Email}:
                                        </div>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.email}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <div>
                                          {langCntnt && langCntnt.phone}:
                                        </div>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.phone}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <div>
                                          {langCntnt && langCntnt.Country}:
                                        </div>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.country.name}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <div>
                                          {langCntnt && langCntnt.State}:
                                        </div>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.country_state.name}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <div>
                                          {langCntnt && langCntnt.City}:
                                        </div>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.city.name}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              {address.id === selectedBilling && (
                                <span className="text-white bg-qpurple px-2 text-sm absolute right-3 rounded -top-2 font-medium">
                                  {langCntnt && langCntnt.Selected}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div
                        data-aos="zoom-in"
                        className="grid sm:grid-cols-2 grid-cols-1 gap-3"
                      >
                        {addresses &&
                          addresses.length > 0 &&
                          addresses.map((address, i) => (
                            <div
                              onClick={() =>
                                shippingHandler(
                                  address.id,
                                  parseInt(address.city_id)
                                )
                              }
                              key={i}
                              className={`w-full p-5 border relative cursor-pointer rounded ${address.id === selectedShipping
                                ? "border-qpurple bg-qpurplelow/10"
                                : "border-transparent bg-primarygray"
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <p className="title text-[22px] font-semibold">
                                  {langCntnt && langCntnt.Address} #{i + 1}
                                </p>
                                <button
                                  onClick={() => deleteAddress(address.id)}
                                  type="button"
                                  className="bg-white shadow group  w-[34px] h-[34px] rounded-full flex justify-center items-center"
                                >
                                  <svg
                                    width="17"
                                    height="25"
                                    viewBox="0 0 17 19"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M15.7768 5.95215C15.6991 6.9104 15.6242 7.84603 15.5471 8.78237C15.3691 10.9285 15.1917 13.0747 15.0108 15.2209C14.9493 15.9473 14.9097 16.6773 14.8065 17.3988C14.6963 18.1726 14.0716 18.7161 13.2929 18.7196C10.3842 18.7323 7.47624 18.7337 4.56757 18.7189C3.70473 18.7146 3.08639 18.0794 3.00795 17.155C2.78181 14.493 2.57052 11.8302 2.35145 9.16821C2.2716 8.19442 2.1875 7.22133 2.10623 6.24824C2.09846 6.15638 2.09563 6.06451 2.08998 5.95286C6.65579 5.95215 11.2061 5.95215 15.7768 5.95215ZM5.25375 8.05803C5.25234 8.05803 5.25163 8.05803 5.25022 8.05803C5.27566 8.4573 5.3011 8.85657 5.32583 9.25584C5.46717 11.5228 5.60709 13.7891 5.75125 16.0561C5.77245 16.3897 5.99081 16.6038 6.28196 16.6024C6.58724 16.601 6.80066 16.3636 6.8056 16.0159C6.80702 15.9339 6.80136 15.8512 6.79571 15.7692C6.65367 13.4789 6.51304 11.1886 6.36888 8.89826C6.33849 8.41702 6.31164 7.93507 6.26146 7.45524C6.22966 7.1549 6.0318 6.99732 5.73076 6.99802C5.44526 6.99873 5.24033 7.2185 5.23043 7.52873C5.22619 7.7054 5.24598 7.88207 5.25375 8.05803ZM12.6102 8.05521C12.6088 8.05521 12.6074 8.05521 12.606 8.05521C12.6152 7.89055 12.6321 7.7259 12.6307 7.56195C12.6286 7.24465 12.4399 7.02417 12.1622 6.99873C11.888 6.97329 11.6484 7.16268 11.5961 7.46443C11.5665 7.63756 11.5615 7.81494 11.5502 7.9909C11.4626 9.38799 11.3749 10.7851 11.2887 12.1822C11.2103 13.4499 11.1276 14.7184 11.0576 15.9869C11.0379 16.3431 11.2463 16.5819 11.5495 16.6003C11.8562 16.6194 12.088 16.4017 12.1099 16.0505C12.2788 13.3856 12.4441 10.7208 12.6102 8.05521ZM9.45916 11.814C9.45916 10.4727 9.45986 9.13147 9.45916 7.79091C9.45916 7.25101 9.28603 6.99449 8.92845 6.99661C8.56805 6.99802 8.40198 7.24819 8.40198 7.79586C8.40127 10.4664 8.40127 13.1369 8.40268 15.8074C8.40268 15.948 8.37088 16.1289 8.44296 16.2194C8.56946 16.3763 8.76591 16.5748 8.93198 16.5741C9.09805 16.5734 9.29309 16.3727 9.41746 16.2151C9.48955 16.124 9.45704 15.9431 9.45704 15.8032C9.46057 14.4725 9.45916 13.1432 9.45916 11.814Z"
                                      fill="#EB5757"
                                    />
                                    <path
                                      className={`transform rotate-0 group-hover:-rotate-[10deg] transition duration-300 ease-in-out`}
                                      d="M5.20143 2.75031C5.21486 2.49449 5.21839 2.2945 5.23747 2.09593C5.31733 1.25923 5.93496 0.648664 6.77449 0.637357C8.21115 0.618277 9.64923 0.618277 11.0859 0.637357C11.9254 0.648664 12.5438 1.25852 12.6236 2.09522C12.6427 2.2938 12.6462 2.49379 12.6582 2.73335C12.7854 2.739 12.9084 2.74889 13.0314 2.7496C13.9267 2.75101 14.8221 2.74677 15.7174 2.75172C16.4086 2.75525 16.8757 3.18774 16.875 3.81244C16.8742 4.43643 16.4078 4.87103 15.716 4.87174C11.1926 4.87386 6.66849 4.87386 2.14508 4.87174C1.45324 4.87103 0.986135 4.43713 0.985429 3.81314C0.984722 3.18915 1.45183 2.75525 2.14296 2.75243C3.15421 2.74677 4.16545 2.75031 5.20143 2.75031ZM11.5799 2.73335C11.5799 2.59625 11.5806 2.49096 11.5799 2.38637C11.5749 1.86626 11.4018 1.69313 10.876 1.69242C9.55878 1.69101 8.24225 1.68959 6.92501 1.69313C6.48546 1.69454 6.30031 1.87545 6.28265 2.3051C6.27699 2.4422 6.28194 2.58 6.28194 2.73335C8.05851 2.73335 9.7941 2.73335 11.5799 2.73335Z"
                                      fill="#EB5757"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="mt-5">
                                <table>
                                  <tbody>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <p>{langCntnt && langCntnt.Name}:</p>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.name}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <p>{langCntnt && langCntnt.Email}:</p>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.email}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <p>{langCntnt && langCntnt.phone}:</p>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.phone}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <p>{langCntnt && langCntnt.Country}:</p>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.country.name}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <p>{langCntnt && langCntnt.State}:</p>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.country_state.name}
                                      </td>
                                    </tr>
                                    <tr className="flex mb-3">
                                      <td className="text-base text-qgray w-[70px] block line-clamp-1">
                                        <p>{langCntnt && langCntnt.City}:</p>
                                      </td>
                                      <td className="text-base text-qblack line-clamp-1 font-medium">
                                        {address.city.name}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              {address.id === selectedShipping && (
                                <span className="text-white rounded bg-qpurple px-2 text-sm absolute right-3 -top-2 font-medium">
                                  {langCntnt && langCntnt.Selected}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                {newAddress && (
                  <div data-aos="zoom-in" className="w-full">
                    <div className="flex justify-between items-center">
                      <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">
                        {langCntnt && langCntnt.Add_New_Address}
                      </h1>
                      <span
                        onClick={() => setNewAddress(!newAddress)}
                        className="text-qpurple cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <div className="form-area bg-[#F8F8F8] md:p-[40px] p-2.5">
                      <form>
                        <div className="mb-6">
                          <div className="sm:flex sm:space-x-5 items-center">
                            <div className="sm:w-1/2 w-full  mb-5 sm:mb-0">
                              <InputCom
                                label={langCntnt && langCntnt.First_Name + "*"}
                                placeholder={langCntnt && langCntnt.First_Name}
                                inputClasses="w-full h-[50px]"
                                value={fName}
                                inputHandler={(e) => setFname(e.target.value)}
                                error={
                                  !!(errors && Object.hasOwn(errors, "name"))
                                }
                              />
                            </div>
                            <div className="sm:w-1/2 w-full">
                              <InputCom
                                label={langCntnt && langCntnt.Last_Name + "*"}
                                placeholder={langCntnt && langCntnt.Last_name}
                                inputClasses="w-full h-[50px]"
                                value={lName}
                                inputHandler={(e) => setlname(e.target.value)}
                                error={
                                  !!(errors && Object.hasOwn(errors, "name"))
                                }
                              />
                            </div>
                          </div>
                          {errors && Object.hasOwn(errors, "name") ? (
                            <span className="text-sm mt-1 text-qred">
                              {errors.name[0]}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="flex space-x-5 items-center mb-6">
                          <div className="sm:w-1/2 w-full">
                            <InputCom
                              label={langCntnt && langCntnt.Email_Address + "*"}
                              placeholder={langCntnt && langCntnt.Email}
                              inputClasses="w-full h-[50px]"
                              value={email}
                              inputHandler={(e) => setEmail(e.target.value)}
                              error={
                                !!(errors && Object.hasOwn(errors, "email"))
                              }
                            />
                            {errors && Object.hasOwn(errors, "email") ? (
                              <span className="text-sm mt-1 text-qred">
                                {errors.email[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="sm:w-1/2 w-full">
                            <InputCom
                              label={langCntnt && langCntnt.Phone_Number + "*"}
                              placeholder="012 3  *******"
                              inputClasses="w-full h-[50px]"
                              value={phone}
                              inputHandler={(e) => setPhone(e.target.value)}
                              error={
                                !!(errors && Object.hasOwn(errors, "phone"))
                              }
                            />
                            {errors && Object.hasOwn(errors, "phone") ? (
                              <span className="text-sm mt-1 text-qred">
                                {errors.phone[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="mb-6">
                          <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                            {langCntnt && langCntnt.Country}*
                          </h1>
                          <div
                            className={`w-full h-[50px] bg-white border px-5 flex justify-between items-center border-qpurplelow/10 rounded mb-2 ${!!(errors && Object.hasOwn(errors, "country"))
                              ? "border-qred"
                              : "border-qpurplelow/10"
                              }`}
                          >
                            <Selectbox
                              action={getState}
                              className="w-full"
                              defaultValue="Select"
                              datas={countryDropdown && countryDropdown}
                            >
                              {({ item }) => (
                                <>
                                  <div className="flex justify-between items-center w-full">
                                    <div>
                                      <span className="text-[13px] text-qblack">
                                        {item}
                                      </span>
                                    </div>
                                    <span>
                                      <svg
                                        width="11"
                                        height="7"
                                        viewBox="0 0 11 7"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                                          fill="#222222"
                                        />
                                      </svg>
                                    </span>
                                  </div>
                                </>
                              )}
                            </Selectbox>
                          </div>
                          {errors && Object.hasOwn(errors, "country") ? (
                            <span className="text-sm mt-1 text-qred">
                              {errors.country[0]}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="flex space-x-5 items-center mb-6">
                          <div className="w-1/2">
                            <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                              {langCntnt && langCntnt.State}*
                            </h1>
                            <div
                              className={`w-full h-[50px] bg-white border px-5 flex justify-between items-center border-qpurplelow/10 rounded mb-2 ${!!(errors && Object.hasOwn(errors, "state"))
                                ? "border-qred"
                                : "border-qpurplelow/10"
                                }`}
                            >
                              <Selectbox
                                action={getcity}
                                className="w-full"
                                defaultValue="Select"
                                datas={stateDropdown && stateDropdown}
                              >
                                {({ item }) => (
                                  <>
                                    <div className="flex justify-between items-center w-full">
                                      <div>
                                        <span className="text-[13px] text-qblack">
                                          {item}
                                        </span>
                                      </div>
                                      <span>
                                        <svg
                                          width="11"
                                          height="7"
                                          viewBox="0 0 11 7"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                                            fill="#222222"
                                          />
                                        </svg>
                                      </span>
                                    </div>
                                  </>
                                )}
                              </Selectbox>
                            </div>
                            {errors && Object.hasOwn(errors, "state") ? (
                              <span className="text-sm mt-1 text-qred">
                                {errors.state[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="w-1/2">
                            <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                              {langCntnt && langCntnt.City}*
                            </h1>
                            <div
                              className={`w-full h-[50px] bg-white border px-5 flex justify-between items-center border-qpurplelow/10 rounded mb-2 ${!!(errors && Object.hasOwn(errors, "city"))
                                ? "border-qred"
                                : "border-qpurplelow/10"
                                }`}
                            >
                              <Selectbox
                                action={selectCity}
                                className="w-full"
                                defaultValue="select"
                                datas={cityDropdown && cityDropdown}
                              >
                                {({ item }) => (
                                  <>
                                    <div className="flex justify-between items-center w-full">
                                      <div>
                                        <span className="text-[13px] text-qblack">
                                          {item}
                                        </span>
                                      </div>
                                      <span>
                                        <svg
                                          width="11"
                                          height="7"
                                          viewBox="0 0 11 7"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                                            fill="#222222"
                                          />
                                        </svg>
                                      </span>
                                    </div>
                                  </>
                                )}
                              </Selectbox>
                            </div>
                            {errors && Object.hasOwn(errors, "city") ? (
                              <span className="text-sm mt-1 text-qred">
                                {errors.city[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className=" mb-6">
                          <div className="w-full">
                            <InputCom
                              value={address}
                              inputHandler={(e) => setAddress(e.target.value)}
                              label={langCntnt && langCntnt.Address + "*"}
                              placeholder={
                                langCntnt && langCntnt.your_address_here
                              }
                              inputClasses="w-full h-[50px]"
                              error={
                                !!(errors && Object.hasOwn(errors, "address"))
                              }
                            />
                            {errors && Object.hasOwn(errors, "address") ? (
                              <span className="text-sm mt-1 text-qred">
                                {errors.address[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-5 items-center ">
                          <div className="flex space-x-2 items-center mb-10">
                            <div>
                              <input
                                checked={home}
                                onChange={() => {
                                  setHome(!home);
                                  setOffice(false);
                                }}
                                type="checkbox"
                                name="home"
                                id="home"
                                className="accent-qpurple"
                              />
                            </div>
                            <label
                              htmlFor="home"
                              className="text-qblack text-[15px] select-none capitalize"
                            >
                              {langCntnt && langCntnt.home}
                            </label>
                          </div>
                          <div className="flex space-x-2 items-center mb-10">
                            <div>
                              <input
                                checked={office}
                                onChange={() => {
                                  setOffice(!office);
                                  setHome(false);
                                }}
                                type="checkbox"
                                name="office"
                                id="office"
                                className="accent-qpurple"
                              />
                            </div>
                            <label
                              htmlFor="office"
                              className="text-qblack text-[15px] select-none"
                            >
                              {langCntnt && langCntnt.Office}
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={saveAddress}
                          type="button"
                          className="w-full h-[50px]"
                        >
                          <div className="green-btn rounded-full">
                            <span className="text-sm text-white">
                              {langCntnt && langCntnt.Save_Address}
                            </span>
                            {loading && (
                              <span
                                className="w-5 "
                                style={{ transform: "scale(0.3)" }}
                              >
                                <LoaderStyleOne />
                              </span>
                            )}
                          </div>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="mb-10">
                  <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                    {langCntnt && langCntnt.Apply_Coupon}
                  </h1>
                  <div className="discount-code rounded overflow-hidden  w-full mb-5 sm:mb-0 h-[50px] flex ">
                    <div className="flex-1 h-full">
                      <InputCom
                        value={inputCoupon}
                        inputHandler={(e) => setInputCoupon(e.target.value)}
                        type="text"
                        placeholder={langCntnt && langCntnt.Discount_code}
                      />
                    </div>
                    <button
                      onClick={submitCoupon}
                      type="button"
                      className="w-[90px] h-[50px]"
                    >
                      <div className="green-btn">
                        <span className="text-sm text-white  font-semibold">
                          {langCntnt && langCntnt.Apply}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                  {langCntnt && langCntnt.Order_Summary}
                </h1>

                <div className="w-full px-10 py-[30px] rounded border border-qpurplelow/10">
                  <div className="sub-total mb-6">
                    <div className=" flex justify-between mb-5">
                      <p className="text-[13px] font-medium text-qblack uppercase">
                        {langCntnt && langCntnt.Product}
                      </p>
                      <p className="text-[13px] font-medium text-qblack uppercase">
                        {langCntnt && langCntnt.total}
                      </p>
                    </div>
                    <div className="w-full h-[1px] bg-qpurplelow/10"></div>
                  </div>
                  <div className="product-list w-full mb-[30px]">
                    <ul className="flex flex-col space-y-5">
                      {carts &&
                        carts.length > 0 &&
                        carts.map((item) => (
                          <li key={item.id}>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4
                                  title={item.product.name}
                                  className="text-[15px] text-qblack line-clamp-1 mb-2.5"
                                >
                                  {wordCount(`${item.product.name}`)}
                                  <sup className="text-[13px] text-qgray ml-2 mt-2">
                                    x{parseInt(item.qty)}
                                  </sup>
                                </h4>
                                <p className="text-[13px] text-qgray line-clamp-1">
                                  {item.variants.length !== 0 &&
                                    item.variants.map((variant, i) => (
                                      <span key={i}>
                                        {variant.variant_item &&
                                          variant.variant_item.name}
                                      </span>
                                    ))}
                                </p>
                              </div>
                              <div>
                                <span
                                  suppressHydrationWarning
                                  className="text-[15px] text-qblack font-medium"
                                >
                                  <CheckProductIsExistsInFlashSale
                                    id={item.product_id}
                                    price={price(item)}
                                  />
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="w-full h-[1px] bg-qpurplelow/10"></div>
                  <div className="mt-[20px]">
                    <div className=" flex justify-between mb-5">
                      <p className="text-[13px] text-qblack uppercase font-bold">
                        {langCntnt && langCntnt.SUBTOTAL}
                      </p>
                      <p
                        suppressHydrationWarning
                        className="text-[15px] font-bold text-qblack uppercase"
                      >
                        {currency_icon
                          ? currency_icon + parseFloat(totalPrice).toFixed(2)
                          : parseFloat(totalPrice).toFixed(2)}
                      </p>
                    </div>
                    <div className=" flex justify-between mb-5">
                      <p className="text-[13px] text-qblack uppercase font-bold">
                        {langCntnt && langCntnt.Discount_coupon} (-)
                      </p>
                      <p
                        suppressHydrationWarning
                        className="text-[15px] font-bold text-qblack uppercase"
                      >
                        {currency_icon
                          ? currency_icon +
                          parseFloat(discountCoupon).toFixed(2)
                          : parseFloat(discountCoupon).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="shipping mb-6 mt-6">
                    <span className="text-[15px] font-medium text-qblack mb-[18px] block">
                      {langCntnt && langCntnt.Shipping} (+)
                    </span>
                    <div className="flex flex-col space-y-2.5">
                      {shippingRulesByCityId &&
                        shippingRulesByCityId.length > 0 &&
                        shippingRulesByCityId.map((rule, i) => (
                          <div key={i}>
                            {rule.type === "base_on_price" ? (
                              <>
                                {parseInt(rule.condition_from) <=
                                  parseInt(totalPrice) && (
                                    <>
                                      {parseInt(rule.condition_to) >=
                                        parseInt(totalPrice) ? (
                                        <div className="flex justify-between items-center">
                                          <div className="flex space-x-2.5 items-center">
                                            <div className="input-radio">
                                              <input
                                                onChange={(e) =>
                                                  selectedRuleHandler(
                                                    e,
                                                    rule.shipping_fee
                                                  )
                                                }
                                                value={rule.id}
                                                type="radio"
                                                name="price"
                                                className="accent-qpurple"
                                              />
                                            </div>
                                            <span className="text-[15px] text-normal text-qgray">
                                              {rule.shipping_rule}
                                            </span>
                                          </div>
                                          <span
                                            suppressHydrationWarning
                                            className="text-[15px] text-normal text-qgray"
                                          >
                                            {currency_icon
                                              ? currency_icon + rule.shipping_fee
                                              : rule.shipping_fee}
                                          </span>
                                        </div>
                                      ) : parseInt(rule.condition_to) === -1 ? (
                                        <div className="flex justify-between items-center">
                                          <div className="flex space-x-2.5 items-center">
                                            <div className="input-radio">
                                              <input
                                                onChange={(e) =>
                                                  selectedRuleHandler(
                                                    e,
                                                    rule.shipping_fee
                                                  )
                                                }
                                                value={rule.id}
                                                type="radio"
                                                name="price"
                                                className="accent-pink-500"
                                              />
                                            </div>
                                            <span className="text-[15px] text-normal text-qgray">
                                              {rule.shipping_rule}
                                            </span>
                                          </div>
                                          <span
                                            suppressHydrationWarning
                                            className="text-[15px] text-normal text-qgray"
                                          >
                                            {currency_icon
                                              ? currency_icon + rule.shipping_fee
                                              : rule.shipping_fee}
                                          </span>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </>
                                  )}
                              </>
                            ) : rule.type === "base_on_weight" ? (
                              <>
                                {parseInt(rule.condition_from) <=
                                  parseInt(totalWeight) && (
                                    <>
                                      {parseInt(rule.condition_to) >=
                                        parseInt(totalWeight) ? (
                                        <div className="flex justify-between items-center">
                                          <div className="flex space-x-2.5 items-center">
                                            <div className="input-radio">
                                              <input
                                                onChange={(e) =>
                                                  selectedRuleHandler(
                                                    e,
                                                    rule.shipping_fee
                                                  )
                                                }
                                                value={rule.id}
                                                type="radio"
                                                name="price"
                                                className="accent-pink-500"
                                              />
                                            </div>
                                            <span className="text-[15px] text-normal text-qgray">
                                              {rule.shipping_rule}
                                            </span>
                                          </div>
                                          <span
                                            suppressHydrationWarning
                                            className="text-[15px] text-normal text-qgray"
                                          >
                                            {currency_icon
                                              ? currency_icon + rule.shipping_fee
                                              : rule.shipping_fee}
                                          </span>
                                        </div>
                                      ) : parseInt(rule.condition_to) === -1 ? (
                                        <div className="flex justify-between items-center">
                                          <div className="flex space-x-2.5 items-center">
                                            <div className="input-radio">
                                              <input
                                                onChange={(e) =>
                                                  selectedRuleHandler(
                                                    e,
                                                    rule.shipping_fee
                                                  )
                                                }
                                                value={rule.id}
                                                type="radio"
                                                name="price"
                                                className="accent-pink-500"
                                              />
                                            </div>
                                            <span className="text-[15px] text-normal text-qgray">
                                              {rule.shipping_rule}
                                            </span>
                                          </div>
                                          <span
                                            suppressHydrationWarning
                                            className="text-[15px] text-normal text-qgray"
                                          >
                                            {currency_icon
                                              ? currency_icon + rule.shipping_fee
                                              : rule.shipping_fee}
                                          </span>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </>
                                  )}
                              </>
                            ) : rule.type === "base_on_qty" ? (
                              <>
                                {parseInt(rule.condition_from) <= totalQty && (
                                  <>
                                    {parseInt(rule.condition_to) >= totalQty ? (
                                      <div className="flex justify-between items-center">
                                        <div className="flex space-x-2.5 items-center">
                                          <div className="input-radio">
                                            <input
                                              onChange={(e) =>
                                                selectedRuleHandler(
                                                  e,
                                                  rule.shipping_fee
                                                )
                                              }
                                              value={rule.id}
                                              type="radio"
                                              name="price"
                                              className="accent-pink-500"
                                            />
                                          </div>
                                          <span className="text-[15px] text-normal text-qgray">
                                            {rule.shipping_rule}
                                          </span>
                                        </div>
                                        <span
                                          suppressHydrationWarning
                                          className="text-[15px] text-normal text-qgray"
                                        >
                                          {currency_icon
                                            ? currency_icon + rule.shipping_fee
                                            : rule.shipping_fee}
                                        </span>
                                      </div>
                                    ) : parseInt(rule.condition_to) == -1 ? (
                                      <div className="flex justify-between items-center">
                                        <div className="flex space-x-2.5 items-center">
                                          <div className="input-radio">
                                            <input
                                              onChange={(e) =>
                                                selectedRuleHandler(
                                                  e,
                                                  rule.shipping_fee
                                                )
                                              }
                                              value={rule.id}
                                              type="radio"
                                              name="price"
                                              className="accent-pink-500"
                                            />
                                          </div>
                                          <span className="text-[15px] text-normal text-qgray">
                                            {rule.shipping_rule}
                                          </span>
                                        </div>
                                        <span
                                          suppressHydrationWarning
                                          className="text-[15px] text-normal text-qgray"
                                        >
                                          {currency_icon
                                            ? currency_icon + rule.shipping_fee
                                            : rule.shipping_fee}
                                        </span>
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                  </>
                                )}
                              </>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="mt-[30px]">
                    <div className=" flex justify-between mb-5">
                      <p className="text-2xl font-medium text-qblack capitalize">
                        {langCntnt && langCntnt.total}
                      </p>
                      <p
                        suppressHydrationWarning
                        className="text-2xl font-medium text-qred"
                      >
                        {currency_icon
                          ? currency_icon +
                          (mainTotalPrice - discountCoupon).toFixed(2)
                          : (mainTotalPrice - discountCoupon).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/*payment methods*/}
                  <div className="mt-[30px] mb-5 relative">
                    <div className="w-full">
                      <div className="flex flex-col space-y-3">
                        {cashOnDeliveryStatus && (
                          <div
                            onClick={() => setPaymentMethod("cashOnDelivery")}
                            className={`payment-item relative bg-[#F8F8F8] text-center w-full h-[50px] text-sm text-qpurple rounded flex justify-center items-center px-3 uppercase rounded cursor-pointer
                              ${selectPayment === "cashOnDelivery"
                                ? "border-2 border-qpurple"
                                : "border border-qpurplelow/10"
                              }
                              `}
                          >
                            <div className="w-full">
                              <span className="text-qblack font-bold text-base">
                                {langCntnt && langCntnt.Cash_On_Delivery}
                              </span>
                            </div>
                            {selectPayment === "cashOnDelivery" && (
                              <span
                                data-aos="zoom-in"
                                className="absolute text-white z-10 w-6 h-6 rounded-full bg-qpurple -right-2.5 -top-2.5"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}






                        {paypalStatus && (
                          <div
                            onClick={() => setPaymentMethod("paypal")}
                            className={`payment-item text-center bg-[#F8F8F8] relative w-full h-[50px] font-bold text-sm text-white text-qpurple  rounded flex justify-center items-center px-3 uppercase rounded cursor-pointer ${selectPayment === "paypal"
                              ? "border-2 border-qpurple"
                              : "border border-qpurplelow/10"
                              }`}
                          >
                            <div className="w-full flex justify-center">
                              <h4 className="text-black">Skipcash</h4>
                              <span>

                                {/* <svg width="400" height="50" viewBox="350 -50 1024 720" xmlns="http://www.w3.org/2000/svg">
                                  <g id="layer1">
                                    <path d="M240,200 L240,100 C340,100 440,200 340,200 Z" fill="#0078D4" />
                                    <path d="M240,400 L240,500 C340,500 440,400 340,400 Z" fill="#00A4EF" />
                                    <path d="M240,300 L240,200 C340,200 440,300 340,300 Z" fill="#2D8CFF" fill-opacity="0.8" />
                                    <text x="480" y="280" font-family="Arial" font-size="200" fill="#0046AB">SkipCash</text>
                                  </g>
                                </svg> */}

                                {/* <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-24 h-24"
                                  viewBox="-.02682843 0 123.63183286 30.17842908"
                                >
                                  <path
                                    d="m46.211 6.749h-6.839a.95.95 0 0 0 -.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zm.789 6.405c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zm19.654-.079h-3.275a.57.57 0 0 0 -.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0 -.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zm22.007-6.374h-3.291a.954.954 0 0 0 -.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0 -.912-.678h-3.234a.57.57 0 0 0 -.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0 -.468-.895z"
                                    fill="#253b80"
                                  />
                                  <path
                                    d="m94.992 6.749h-6.84a.95.95 0 0 0 -.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zm19.653-.079h-3.273a.567.567 0 0 0 -.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0 -.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zm8.426-12.219-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0 -.562-.659h-3.16a.571.571 0 0 0 -.562.482z"
                                    fill="#179bd7"
                                  />
                                  <path
                                    d="m7.266 29.154.523-3.322-1.165-.027h-5.563l3.866-24.513a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1 -1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0 -.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1 -.096.035z"
                                    fill="#253b80"
                                  />
                                  <path
                                    d="m23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545h-2.752c-.661 0-1.218.48-1.321 1.132l-1.409 8.936-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0 -1.336-1.03z"
                                    fill="#179bd7"
                                  />
                                  <path
                                    d="m21.754 7.151a9.757 9.757 0 0 0 -1.203-.267 15.284 15.284 0 0 0 -2.426-.177h-7.352a1.172 1.172 0 0 0 -1.159.992l-1.564 9.906-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0 -1.017-.429 9.045 9.045 0 0 0 -.277-.087z"
                                    fill="#222d65"
                                  />
                                  <path
                                    d="m9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392-1.399-1.593-3.924-2.275-7.155-2.275h-9.38c-.66 0-1.223.48-1.325 1.133l-3.907 24.765a.806.806 0 0 0 .795.932h5.791l1.454-9.225z"
                                    fill="#253b80"
                                  />
                                </svg> */}
                              </span>
                            </div>
                            {selectPayment === "paypal" && (
                              <span
                                data-aos="zoom-in"
                                className="absolute text-white z-10 w-6 h-6 rounded-full bg-qpurple -right-2.5 -top-2.5"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}


                      </div>
                    </div>
                    {/*stripe*/}

                  </div>

                  <button
                    type="button"
                    onClick={placeOrderHandler}
                    className="w-full"
                  >
                    <div className="w-full h-[50px] flex justify-center items-center">
                      <div className="transition-common bg-qpurple hover:bg-qpurplelow/10 hover:text-qpurple border border-transparent hover:border-qpurple text-white w-full h-full flex justify-center items-center rounded">
                        <span className="text-sm font-semibold">
                          {langCntnt && langCntnt.Place_Order_Now}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="checkout-page-wrapper w-full bg-white pb-[120px]">
        <div className="w-full md:block hidden mb-5">
          <PageTitle
            title={langCntnt && langCntnt.checkout}
            breadcrumb={[
              { name: langCntnt && langCntnt.home, path: "/" },
              { name: langCntnt && langCntnt.checkout, path: "/checkout" },
            ]}
          />
        </div>
        <div className="container-x mx-auto md:mt-[60px]">
          <EmptyCardError />
        </div>
      </div>
    );
  }
}
export default isAuth(CheakoutPage);
