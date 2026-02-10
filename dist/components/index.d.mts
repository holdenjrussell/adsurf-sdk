import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';
import { b as Product } from '../api-BTVT5zs0.mjs';

interface AddToCartButtonProps {
    product: {
        id: string;
        title: string;
        handle: string;
        images?: Array<{
            url: string;
            altText: string | null;
        }>;
    };
    variant: {
        id: string;
        title: string;
        price: number;
        compareAtPrice: number | null;
        availableForSale: boolean;
    };
    quantity?: number;
    className?: string;
    children?: React.ReactNode;
    onAdd?: () => void;
}
declare function AddToCartButton({ product, variant, quantity, className, children, onAdd, }: AddToCartButtonProps): react_jsx_runtime.JSX.Element;

interface CartDrawerProps {
    onCheckout?: () => void;
    className?: string;
    overlayClassName?: string;
    drawerClassName?: string;
    formatPrice?: (price: number) => string;
}
/**
 * Slide-out cart drawer component
 *
 * Provides a default styling but can be customized via className props
 */
declare function CartDrawer({ onCheckout, className, overlayClassName, drawerClassName, formatPrice, }: CartDrawerProps): react_jsx_runtime.JSX.Element | null;

interface ProductCardProps {
    product: Product;
    className?: string;
    showAddToCart?: boolean;
    onProductClick?: (product: Product) => void;
    imageClassName?: string;
    priceFormatter?: (amount: number, currency: string) => string;
}
declare function ProductCard({ product, className, showAddToCart, onProductClick, imageClassName, priceFormatter, }: ProductCardProps): react_jsx_runtime.JSX.Element;

interface CustomerPortalProps {
    className?: string;
    apiKey?: string;
    baseUrl?: string;
    onLoginRedirect?: () => void;
    formatPrice?: (amount: string, currency: string) => string;
}
declare function CustomerPortal({ className, apiKey, baseUrl, onLoginRedirect, formatPrice, }: CustomerPortalProps): react_jsx_runtime.JSX.Element;

interface SellingPlan {
    id: string;
    name: string;
    description?: string;
    priceAdjustmentType: 'percentage' | 'fixed_amount' | 'price';
    priceAdjustmentValue: number;
    deliveryFrequency: string;
    deliveryInterval: 'day' | 'week' | 'month' | 'year';
    deliveryIntervalCount: number;
}
interface SubscribeWidgetProps {
    product: Product;
    variant: Product['variants'][0];
    sellingPlans: SellingPlan[];
    className?: string;
    onSubscribe?: (variantId: string, sellingPlanId: string, quantity: number) => void;
    onOneTimePurchase?: (variantId: string, quantity: number) => void;
    showOneTimePurchase?: boolean;
    defaultSelection?: 'subscribe' | 'one-time';
    priceFormatter?: (amount: number, currency: string) => string;
}
declare function SubscribeWidget({ product, variant, sellingPlans, className, onSubscribe, onOneTimePurchase, showOneTimePurchase, defaultSelection, priceFormatter, }: SubscribeWidgetProps): react_jsx_runtime.JSX.Element;

export { AddToCartButton, type AddToCartButtonProps, CartDrawer, type CartDrawerProps, CustomerPortal, type CustomerPortalProps, ProductCard, type ProductCardProps, type SellingPlan, SubscribeWidget, type SubscribeWidgetProps };
