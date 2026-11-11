CREATE OR REPLACE FUNCTION check_and_increment_ai_quota(p_user_id uuid, p_limit smallint)
RETURNS TABLE(allowed boolean, used smallint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used smallint;
  v_reset_at timestamptz;
  v_now timestamptz := now();
BEGIN
  SELECT ai_analyses_used, ai_analyses_reset_at
  INTO v_used, v_reset_at
  FROM user_preferences
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::smallint;
    RETURN;
  END IF;

  -- Reset si nouveau mois
  IF EXTRACT(YEAR FROM v_now) <> EXTRACT(YEAR FROM v_reset_at) OR
     EXTRACT(MONTH FROM v_now) <> EXTRACT(MONTH FROM v_reset_at) THEN
    v_used := 0;
    UPDATE user_preferences
    SET ai_analyses_used = 0, ai_analyses_reset_at = v_now
    WHERE user_id = p_user_id;
  END IF;

  -- Vérifier quota
  IF v_used >= p_limit THEN
    RETURN QUERY SELECT false, v_used;
    RETURN;
  END IF;

  -- Incrémenter
  UPDATE user_preferences
  SET ai_analyses_used = ai_analyses_used + 1
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, (v_used + 1)::smallint;
END;
$$;
