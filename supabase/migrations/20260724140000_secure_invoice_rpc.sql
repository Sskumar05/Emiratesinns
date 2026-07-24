-- Create a secure SECURITY DEFINER function that bypasses RLS to fetch booking and customer details for invoice generation.
CREATE OR REPLACE FUNCTION public.get_invoice_data(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- 1. Try to fetch from invoices if an invoice already exists for the booking
  SELECT row_to_json(i)::jsonb || jsonb_build_object(
           'bookings', row_to_json(b)::jsonb || jsonb_build_object(
             'customers', row_to_json(c)::jsonb,
             'hotels', row_to_json(h)::jsonb
           )
         )
  INTO v_result
  FROM public.invoices i
  JOIN public.bookings b ON i.booking_id = b.id
  LEFT JOIN public.customers c ON b.customer_id = c.id
  LEFT JOIN public.hotels h ON b.hotel_id = h.id
  WHERE i.booking_id = p_booking_id
  LIMIT 1;

  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  -- 2. If no invoice exists, fetch directly from bookings
  SELECT row_to_json(b)::jsonb || jsonb_build_object(
           'customers', row_to_json(c)::jsonb,
           'hotels', row_to_json(h)::jsonb
         )
  INTO v_result
  FROM public.bookings b
  LEFT JOIN public.customers c ON b.customer_id = c.id
  LEFT JOIN public.hotels h ON b.hotel_id = h.id
  WHERE b.id = p_booking_id
  LIMIT 1;

  RETURN v_result;
END;
$$;

-- Grant execution permission so anon and authenticated users can run this RPC
GRANT EXECUTE ON FUNCTION public.get_invoice_data(UUID) TO anon, authenticated;
