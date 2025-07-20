# Install Admin Dashboard Dependencies

## Required Dependencies

The admin dashboard requires additional UI components. Install them with:

```bash
# Install missing Radix UI components
pnpm add @radix-ui/react-label @radix-ui/react-select @radix-ui/react-switch

# Or if you prefer npm
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-switch
```

## Already Included

These dependencies are already in package.json:
- ✅ `class-variance-authority` - For component variants
- ✅ `@types/nodemailer` - TypeScript types for email
- ✅ `clsx` and `tailwind-merge` - For utility functions
- ✅ `lucide-react` - For icons

## Verification

After installation, verify everything works:

```bash
# Test the admin dashboard
pnpm test:admin-dashboard

# Start the development server
pnpm dev
```

Then navigate to `/admin` to access the dashboard.

## Troubleshooting

If you see module not found errors:

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   pnpm dev
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Check imports:**
   Make sure all UI components are properly imported in the admin components.

## UI Components Created

The following UI components have been created for the admin dashboard:

- ✅ `components/ui/badge.tsx` - Status badges
- ✅ `components/ui/card.tsx` - Card layouts
- ✅ `components/ui/input.tsx` - Form inputs
- ✅ `components/ui/label.tsx` - Form labels
- ✅ `components/ui/select.tsx` - Dropdown selects
- ✅ `components/ui/switch.tsx` - Toggle switches

These components follow the shadcn/ui design system and are fully compatible with your existing UI.
