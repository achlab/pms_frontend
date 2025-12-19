# Payment System Test Plan

## Backend Implementation Status: ✅ COMPLETED
The backend has been implemented according to the TENANT_PAYMENT_BACKEND_IMPLEMENTATION.md guide.

---

## Test Scenario 1: Tenant Payment Submission

### Steps:
1. **Navigate to Payment Page**:
   - Go to http://localhost:3000/pay-rent
   - Ensure page loads without errors

2. **Fill Payment Form**:
   ```
   Amount: 9000
   Payment Method: Airtel Tigo
   Transaction ID: 987654321234567
   Payment Date: Today's date
   Notes: Test payment from tenant
   ```

3. **Submit Payment**:
   - Click "Submit Payment" 
   - Check confirmation modal appears
   - Click "Confirm Payment"

4. **Expected Results**:
   - ✅ No 500 Internal Server Error
   - ✅ Success toast: "Payment submitted successfully! Your landlord will verify it shortly."
   - ✅ Form resets after submission
   - ✅ Confirmation modal closes

---

## Test Scenario 2: Landlord Notification

### Steps:
1. **After tenant payment submission**:
   - Switch to landlord account or open landlord dashboard
   - Check notification bell icon (top-right)

2. **Expected Results**:
   - ✅ Notification bell shows unread count
   - ✅ Click bell shows payment notification
   - ✅ Notification displays with green dollar icon
   - ✅ Shows amount: "₵9,000.00"
   - ✅ Shows tenant name and property info
   - ✅ Click notification navigates to /payments page

---

## Test Scenario 3: Payment History & Sorting

### Steps:
1. **Navigate to Payment History**:
   - Go to http://localhost:3000/payments (landlord view)

2. **Check Payment Sorting**:
   - Verify latest payment appears first
   - Check payment details match submission

3. **Expected Results**:
   - ✅ New payment appears at top of list
   - ✅ Payment shows correct amount (₵9,000.00)
   - ✅ Payment method shows "Airtel Tigo"
   - ✅ Payment status shows "Recorded"
   - ✅ Reference number matches transaction ID
   - ✅ Date filtering works (if available)

---

## Test Scenario 4: Error Handling

### Steps:
1. **Test Invalid Data**:
   - Submit payment with empty amount
   - Submit with invalid payment method
   - Submit with future date

2. **Expected Results**:
   - ✅ Validation errors display clearly
   - ✅ Form doesn't submit with invalid data
   - ✅ User-friendly error messages

---

## Console Logs to Monitor

During testing, monitor browser console for:

### Success Indicators:
```
Payment data being sent: {amount: 9000, payment_method: "airtel_tigo", ...}
Payment recorded: {payment_id: "...", receipt_number: "RCT-20251219-..."}
```

### Error Indicators:
```
❌ API Error: POST /tenant/payments
Error submitting payment: [error details]
```

---

## Backend Logs to Check

Monitor Laravel logs for:

### Success Indicators:
```
[INFO] Tenant payment submission started
[INFO] Payment record created
[INFO] Payment notification sent to landlord
```

### Error Indicators:
```
[ERROR] Tenant payment submission failed
[ERROR] Database error during payment creation
[WARNING] Tenant payment validation failed
```

---

## Quick Debugging Commands

If issues arise:

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Verify routes are registered
php artisan route:list | grep tenant

# Test database connection
php artisan tinker
\App\Models\Payment::count()

# Clear caches
php artisan config:clear
php artisan route:clear
```

---

## Success Criteria

✅ **Payment Submission**: Tenant can submit payment without 500 error
✅ **Data Storage**: Payment is saved to database with correct fields
✅ **Notification**: Landlord receives in-app notification
✅ **Display**: Payment appears in landlord's payment history (latest first)
✅ **UI/UX**: All forms work smoothly with proper feedback

---

## Next Steps After Testing

1. **If all tests pass**: Payment system is fully functional
2. **If notifications don't work**: Check notification polling interval
3. **If sorting is wrong**: Verify frontend sends sort_by/sort_order parameters
4. **If validation fails**: Check backend validation rules match frontend

The payment system should now work end-to-end with proper notifications! 🎉