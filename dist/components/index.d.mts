import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
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

interface ApplicationField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'url' | 'number';
    required?: boolean;
    placeholder?: string;
    options?: {
        value: string;
        label: string;
    }[];
    validation?: (value: string) => string | null;
}
interface ApplicationFormProps {
    /** Form title */
    title: string;
    /** Form description/subtitle */
    description?: string;
    /** Fields to render */
    fields: ApplicationField[];
    /** API endpoint to submit to (relative or absolute) */
    endpoint: string;
    /** HTTP method (default: POST) */
    method?: 'POST' | 'PUT';
    /** Additional data to include in submission */
    additionalData?: Record<string, unknown>;
    /** Submit button text */
    submitLabel?: string;
    /** Submitting button text */
    submittingLabel?: string;
    /** Success message */
    successMessage?: string;
    /** Called on successful submission */
    onSuccess?: (response: unknown) => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Custom header content */
    headerContent?: ReactNode;
    /** Custom footer content */
    footerContent?: ReactNode;
    /** Custom class name for form container */
    className?: string;
    /** Custom styles */
    styles?: {
        container?: string;
        title?: string;
        description?: string;
        field?: string;
        label?: string;
        input?: string;
        button?: string;
        error?: string;
        success?: string;
    };
}
declare function ApplicationForm({ title, description, fields, endpoint, method, additionalData, submitLabel, submittingLabel, successMessage, onSuccess, onError, headerContent, footerContent, className, styles, }: ApplicationFormProps): react_jsx_runtime.JSX.Element;
/**
 * Pre-configured creator/contractor application form
 */
declare function CreatorApplicationForm({ endpoint, title, description, onSuccess, onError, ...props }: Omit<ApplicationFormProps, 'fields'> & {
    endpoint: string;
}): react_jsx_runtime.JSX.Element;
/**
 * Pre-configured vendor/wholesale application form
 */
declare function VendorApplicationForm({ endpoint, title, description, onSuccess, onError, ...props }: Omit<ApplicationFormProps, 'fields'> & {
    endpoint: string;
}): react_jsx_runtime.JSX.Element;
/**
 * Simple contact form
 */
declare function ContactForm({ endpoint, title, description, onSuccess, onError, ...props }: Omit<ApplicationFormProps, 'fields'> & {
    endpoint: string;
}): react_jsx_runtime.JSX.Element;

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    available: boolean;
}
interface EventType {
    id: string;
    slug: string;
    title: string;
    description?: string;
    duration: number;
    price?: number;
    currency?: string;
}
interface BookingData {
    eventTypeId: string;
    slotId: string;
    startTime: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
}
interface BookingWidgetProps {
    /** API base URL for fetching availability and creating bookings */
    apiBaseUrl: string;
    /** Optional event type to pre-select */
    eventTypeId?: string;
    /** Optional user/team slug for specific availability */
    userSlug?: string;
    /** Called when booking is successful */
    onBookingComplete?: (booking: unknown) => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Custom header content */
    headerContent?: ReactNode;
    /** Custom footer content */
    footerContent?: ReactNode;
    /** Custom class names */
    className?: string;
    /** Custom styles */
    styles?: {
        container?: string;
        calendar?: string;
        timeSlot?: string;
        selectedSlot?: string;
        form?: string;
        button?: string;
    };
}
declare function BookingWidget({ apiBaseUrl, eventTypeId: preselectedEventTypeId, userSlug, onBookingComplete, onError, headerContent, footerContent, className, styles, }: BookingWidgetProps): react_jsx_runtime.JSX.Element;

export { AddToCartButton, type AddToCartButtonProps, type ApplicationField, ApplicationForm, type ApplicationFormProps, type BookingData, BookingWidget, type BookingWidgetProps, CartDrawer, type CartDrawerProps, ContactForm, CreatorApplicationForm, CustomerPortal, type CustomerPortalProps, type EventType, ProductCard, type ProductCardProps, type SellingPlan, SubscribeWidget, type SubscribeWidgetProps, type TimeSlot, VendorApplicationForm };
