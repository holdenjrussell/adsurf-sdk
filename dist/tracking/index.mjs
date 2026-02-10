// src/tracking/analytics.ts
function initializeAnalytics(config) {
  if (typeof window === "undefined") return;
  if (config.ga4Id && !window.gtag) {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`;
    script.async = true;
    document.head.appendChild(script);
    window.gtag = function() {
      ;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(arguments);
    };
    window.gtag("js", /* @__PURE__ */ new Date());
    window.gtag("config", config.ga4Id);
  }
  if (config.metaPixelId && !window.fbq) {
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${config.metaPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }
  if (config.clarityId && !window.clarity) {
    const script = document.createElement("script");
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${config.clarityId}");
    `;
    document.head.appendChild(script);
  }
}
function trackPageView(pagePath, pageTitle) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle
  });
  window.fbq?.("track", "PageView");
}
function trackViewItem(item) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "view_item", {
    currency: "USD",
    value: item.price,
    items: [item]
  });
  window.fbq?.("track", "ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price,
    currency: "USD"
  });
}
function trackAddToCart(item) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "add_to_cart", {
    currency: "USD",
    value: item.price * item.quantity,
    items: [item]
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price * item.quantity,
    currency: "USD"
  });
}
function trackRemoveFromCart(item) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "remove_from_cart", {
    currency: "USD",
    value: item.price * item.quantity,
    items: [item]
  });
}
function trackBeginCheckout(items, value) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "begin_checkout", {
    currency: "USD",
    value,
    items
  });
  window.fbq?.("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.item_id),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: "USD"
  });
}
function trackPurchase(transactionId, items, value) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value,
    items
  });
  window.fbq?.("track", "Purchase", {
    content_ids: items.map((i) => i.item_id),
    content_type: "product",
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: "USD"
  });
}
function trackEvent(eventName, params) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
}

// src/tracking/pixel.ts
var pixelConfig = null;
function initializePixel(config) {
  pixelConfig = config;
  if (typeof window !== "undefined") {
    const script = document.createElement("script");
    script.src = `${config.platformUrl}/pixel.js`;
    script.async = true;
    script.dataset.brandId = config.brandId;
    document.head.appendChild(script);
  }
}
function trackPixelPageView(path) {
  if (typeof window === "undefined" || !pixelConfig) return;
  sendPixelEvent({
    event: "page_view",
    metadata: {
      path: path || window.location.pathname,
      referrer: document.referrer,
      url: window.location.href
    }
  });
}
function trackPixelProductView(productId, productName, price) {
  sendPixelEvent({
    event: "view_item",
    value: price,
    items: [
      {
        id: productId,
        name: productName,
        price: price || 0,
        quantity: 1
      }
    ]
  });
}
function trackPixelAddToCart(productId, productName, price, quantity) {
  sendPixelEvent({
    event: "add_to_cart",
    value: price * quantity,
    items: [
      {
        id: productId,
        name: productName,
        price,
        quantity
      }
    ]
  });
}
function trackPixelCheckoutStart(cartValue, items) {
  sendPixelEvent({
    event: "begin_checkout",
    value: cartValue,
    items
  });
}
function trackPixelPurchase(orderId, value, currency, items) {
  sendPixelEvent({
    event: "purchase",
    orderId,
    value,
    currency,
    items
  });
}
function trackPixelCustomEvent(eventName, data) {
  sendPixelEvent({
    event: eventName,
    metadata: data
  });
}
function sendPixelEvent(data) {
  if (typeof window === "undefined" || !pixelConfig) return;
  const payload = JSON.stringify({
    ...data,
    brandId: pixelConfig.brandId,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });
  const endpoint = `${pixelConfig.platformUrl}/api/pixel/track`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload);
  } else {
    fetch(endpoint, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true
    }).catch(() => {
    });
  }
}
function getSessionId() {
  if (typeof window === "undefined") return "";
  const key = "adsurf_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}
export {
  initializeAnalytics,
  initializePixel,
  trackAddToCart,
  trackBeginCheckout,
  trackEvent,
  trackPageView,
  trackPixelAddToCart,
  trackPixelCheckoutStart,
  trackPixelCustomEvent,
  trackPixelPageView,
  trackPixelProductView,
  trackPixelPurchase,
  trackPurchase,
  trackRemoveFromCart,
  trackViewItem
};
//# sourceMappingURL=index.mjs.map