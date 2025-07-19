# Documentation

This folder contains documentation and testing utilities for the NDIHub project.

## Structure

```
docs/
├── README.md                           # This file
├── CURRENCY_MIGRATION.md               # Currency migration guide (USD → KSh)
├── INTASEND_DEFAULT_IMPLEMENTATION.md  # IntaSend default implementation summary
└── tests/                              # Testing documentation and scripts
    ├── INTASEND_WEBHOOK_SETUP.md    # IntaSend webhook setup guide
    ├── test-instasend-basic.ts      # Basic IntaSend integration test
    ├── test-instasend.ts            # Full IntaSend API test
    ├── test-intasend-webhook.ts     # IntaSend webhook endpoint test
    ├── test-currency-conversion.ts  # Currency conversion utilities test
    └── test-ui-currency.ts          # UI currency display components test
```

## Testing Scripts

All test scripts can be run from the project root using npm scripts:

### IntaSend Tests

```bash
# Basic IntaSend setup verification
npm run test:instasend

# Full IntaSend API test with checkout creation
npm run test:instasend:full

# IntaSend webhook endpoint test
npm run test:instasend:webhook

# Currency conversion utilities test
npm run test:currency

# UI currency display components test
npm run test:ui
```

## Documentation Files

### IntaSend Webhook Setup

- **File**: `tests/INTASEND_WEBHOOK_SETUP.md`
- **Purpose**: Complete guide for setting up IntaSend webhooks
- **Includes**: Environment setup, webhook configuration, testing, and production deployment

## Adding New Documentation

When adding new documentation:

1. **Testing-related docs**: Place in `docs/tests/`
2. **General project docs**: Place in `docs/`
3. **Update this README**: Add new files to the structure above
4. **Update package.json**: Add npm scripts for new test files

## File Naming Conventions

- **Documentation**: Use `UPPERCASE_WITH_UNDERSCORES.md`
- **Test scripts**: Use `test-feature-name.ts`
- **Setup guides**: Use `FEATURE_SETUP.md`

## Environment Variables

Test scripts automatically load environment variables from the project root `.env.local` file.

## Running Tests

All test scripts should be run from the project root directory to ensure proper path resolution and environment variable loading.
