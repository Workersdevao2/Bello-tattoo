# Bello Tattoo — Website

Premium static website for **Bello Tattoo** (Luanda, Angola).  
Pure HTML / CSS / JS — ready for **Cloudflare Pages** or **GitHub Pages**.

## Structure

```
/
├── index.html          # Home (hero, about, store card, prices, gallery, booking form, contact)
├── products.html       # Aftercare shop + cart → WhatsApp
├── policies.html       # Studio policies
├── faq.html            # FAQ + Aftercare guide
├── favicon.ico
├── favicon-16.png
├── favicon-32.png
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── images/
    ├── logo.jpg
    ├── studio.jpg
    └── gallery-1…7.jpg
```

## Features

- **Portuguese (Angola)** primary + English toggle (saved in localStorage)
- Thin-line premium design (cream / charcoal / soft red accent)
- Mobile-first, fully responsive
- Floating WhatsApp button
- Booking form → WhatsApp message
- Product cart → WhatsApp order
- Artistic store card on homepage linking to products
- Placeholder prices (owner can update later)
- Policies + FAQ + Aftercare guide

## Deploy

1. Push this folder to a GitHub repository.
2. Connect the repo to Cloudflare Pages (or enable GitHub Pages).
3. Root directory = `/` (or the folder containing `index.html`).
4. No build step required.

## WhatsApp number

Configured as `244933107034` (+244 933 107 034).  
To change: edit `js/main.js` (`WA_NUMBER`) and the floating button links in each HTML file.

## Updating prices / products

- Prices: edit the price cards in `index.html` (section `#prices`).
- Products: edit the product cards in `products.html` (`data-id`, `data-name`, `data-price` and content).

## Contact

- WhatsApp: +244 933 107 034  
- Location: Prenda–Luanda, Maianga — Rua dos Funantes (Frente ao Lote 6)  
- Instagram / Facebook links are in the footer and contact section.
