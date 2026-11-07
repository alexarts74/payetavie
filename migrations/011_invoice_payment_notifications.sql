-- Tracking des emails de relance envoyés par facture
CREATE TABLE IF NOT EXISTS invoice_payment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES billing_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoice_notif_invoice ON invoice_payment_notifications(invoice_id);

-- RPC : met à jour le statut des factures en retard et retourne celles à notifier
CREATE OR REPLACE FUNCTION get_overdue_invoices_to_notify()
RETURNS TABLE (
  invoice_id UUID,
  user_id UUID,
  user_email TEXT,
  document_number TEXT,
  client_name TEXT,
  due_date DATE,
  total_ttc NUMERIC,
  days_overdue INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Transition automatique envoyee → en_retard
  UPDATE billing_documents
  SET status = 'en_retard', updated_at = NOW()
  WHERE type = 'invoice'
    AND status = 'envoyee'
    AND due_date < CURRENT_DATE;

  -- Retourne les factures en retard depuis ≤7 jours, pas encore notifiées
  RETURN QUERY
  SELECT
    bd.id,
    bd.user_id,
    u.email::TEXT,
    bd.document_number::TEXT,
    c.company_name::TEXT,
    bd.due_date::DATE,
    bd.total_ttc,
    (CURRENT_DATE - bd.due_date)::INTEGER
  FROM billing_documents bd
  JOIN auth.users u ON bd.user_id = u.id
  JOIN clients c ON bd.client_id = c.id
  WHERE bd.type = 'invoice'
    AND bd.status = 'en_retard'
    AND bd.due_date >= (CURRENT_DATE - INTERVAL '7 days')
    AND NOT EXISTS (
      SELECT 1 FROM invoice_payment_notifications n
      WHERE n.invoice_id = bd.id
    );
END;
$$;
