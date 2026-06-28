-- Create a secure SECURITY DEFINER function that bypasses RLS to upsert a customer
-- and return their UUID. This avoids exposing the customers table to public SELECT/UPDATE.
CREATE OR REPLACE FUNCTION public.upsert_customer_for_booking(
  p_full_name TEXT,
  p_mobile    TEXT,
  p_email     TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Try to update an existing customer matched by mobile number
  UPDATE public.customers
  SET    full_name  = p_full_name,
         email      = p_email,
         updated_at = now()
  WHERE  mobile = p_mobile
  RETURNING id INTO v_customer_id;

  -- If no existing record was found, insert a brand-new customer
  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (full_name, mobile, email)
    VALUES (p_full_name, p_mobile, p_email)
    RETURNING id INTO v_customer_id;
  END IF;

  RETURN v_customer_id;
END;
$$;

-- Grant execute permission so anon and authenticated users can invoke this RPC.
-- Without this, PostgREST will not expose the function even if it exists in the DB.
GRANT EXECUTE ON FUNCTION public.upsert_customer_for_booking(TEXT, TEXT, TEXT)
  TO anon, authenticated;
