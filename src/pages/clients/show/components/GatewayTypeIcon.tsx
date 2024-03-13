/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CSSProperties, MouseEvent } from 'react';
import visaLogo from '/gateway-card-images/visa.png';
import authorizeLogo from '/gateway-card-images/authorize-net.png';
import americanExpressLogo from '/gateway-card-images/american-express.png';
import masterCardLogo from '/gateway-card-images/mastercard.png';
import paypalLogo from '/gateway-card-images/paypal.png';
import braintreeLogo from '/gateway-card-images/braintree.svg.png';
import checkoutcomLogo from '/gateway-card-images/checkout.jpg';
import goCardlessLogo from '/gateway-card-images/gocardless.png';
import mollieLogo from '/gateway-card-images/mollie.png';
import payfastLogo from '/gateway-card-images/payfast.png';
import paytraceLogo from '/gateway-card-images/paytrace.svg';
import razorpayLogo from '/gateway-card-images/razorpay.png';
import squareLogo from '/gateway-card-images/square.svg.png';
import stripeLogo from '/gateway-card-images/stripe.svg';
import ewayLogo from '/gateway-card-images/eway.png';
import forteLogo from '/gateway-card-images/forte.png';
import wepayLogo from '/gateway-card-images/wepay.svg';

interface Props {
  name: string;
  onClick?: (event: MouseEvent<HTMLImageElement>) => void;
  style?: CSSProperties;
}

export const availableGatewayLogos = [
  'paypal_ppcp',
  'visa',
  'american_express',
  'mastercard',
  'paypal',
  'authorize',
  'braintree',
  'checkoutcom',
  'gocardless',
  'mollie',
  'payfast',
  'paytrace',
  'razorpay',
  'square',
  'stripe',
  'wepay',
  'eway',
  'forte',
];

export function GatewayTypeIcon(props: Props) {
  const { onClick } = props;

  switch (props.name) {
    case 'visa':
      return (
        <img
          onClick={onClick}
          src={visaLogo}
          alt="Visa"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    case 'american_express':
      return (
        <img
          onClick={onClick}
          src={americanExpressLogo}
          alt="American Express"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    case 'mastercard':
      return (
        <img
          onClick={onClick}
          src={masterCardLogo}
          alt="Mastercard"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    case 'paypal':
      return (
        <img
          onClick={onClick}
          src={paypalLogo}
          alt="PayPal"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'paypal_ppcp':
      return (
        <img
          onClick={onClick}
          src={paypalLogo}
          alt="PayPal"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'authorize':
      return (
        <img
          onClick={onClick}
          src={authorizeLogo}
          alt="AuthorizeNet"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'braintree':
      return (
        <img
          onClick={onClick}
          src={braintreeLogo}
          alt="Braintree"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'checkoutcom':
      return (
        <img
          onClick={onClick}
          src={checkoutcomLogo}
          alt="Checkoutcom"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'gocardless':
      return (
        <img
          onClick={onClick}
          src={goCardlessLogo}
          alt="GoCardless"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'mollie':
      return (
        <img
          onClick={onClick}
          src={mollieLogo}
          alt="Mollie"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'payfast':
      return (
        <img
          onClick={onClick}
          src={payfastLogo}
          alt="Payfast"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'paytrace':
      return (
        <img
          onClick={onClick}
          src={paytraceLogo}
          alt="Paytrace"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'razorpay':
      return (
        <img
          onClick={onClick}
          src={razorpayLogo}
          alt="Razorpay"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'square':
      return (
        <img
          onClick={onClick}
          src={squareLogo}
          alt="Square"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'stripe':
      return (
        <img
          onClick={onClick}
          src={stripeLogo}
          alt="Stripe"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'eway':
      return (
        <img
          onClick={onClick}
          src={ewayLogo}
          alt="Eway"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'forte':
      return (
        <img
          onClick={onClick}
          src={forteLogo}
          alt="Forte"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'wepay':
      return (
        <img
          onClick={onClick}
          src={wepayLogo}
          alt="Wepay"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    default:
      return <></>;
  }
}
