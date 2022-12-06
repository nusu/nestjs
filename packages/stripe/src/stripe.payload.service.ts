import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';
import
{
  InjectStripeClient,
  InjectStripeModuleConfig,
} from './stripe.decorators';
import { StripeModuleConfig } from './stripe.interfaces';

type StripeWebhookType = 'account' | 'connect'

@Injectable()
export class StripePayloadService
{
  private readonly stripeWebhookSecret: string;
  private readonly stripeConnectWebhookSecret: string;

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeModuleConfig,
    @InjectStripeClient()
    private readonly stripeClient: Stripe
  )
  {
    this.stripeWebhookSecret =
      this.config.webhookConfig?.stripeSecrets.account || '';
    this.stripeConnectWebhookSecret =
      this.config.webhookConfig?.stripeSecrets.connect || '';
  }

  tryHydratePayload(signature: string, payload: Buffer, webhookType: StripeWebhookType): { type: string }
  {
    return this.stripeClient.webhooks.constructEvent(
      payload,
      signature,
      webhookType === "account" ? this.stripeWebhookSecret : this.stripeConnectWebhookSecret
    );
  }
}
