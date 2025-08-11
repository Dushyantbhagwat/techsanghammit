-- Create business_promotions table
CREATE TABLE IF NOT EXISTS business_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('DISCOUNT', 'EVENT', 'NEW_OPENING')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL,
  location POINT NOT NULL,
  contact_info JSONB NOT NULL,
  image_url TEXT,
  poster_url TEXT,
  city TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to get nearby promotions
CREATE OR REPLACE FUNCTION get_nearby_promotions(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT
)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  description TEXT,
  category TEXT,
  promotion_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  address TEXT,
  location POINT,
  contact_info JSONB,
  image_url TEXT,
  poster_url TEXT,
  city TEXT,
  featured BOOLEAN,
  created_at TIMESTAMPTZ,
  distance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.*,
    point(user_lng, user_lat) <-> bp.location as distance
  FROM
    business_promotions bp
  WHERE
    point(user_lng, user_lat) <-> bp.location <= radius_km * 1000  -- Convert km to meters
    AND bp.end_date >= NOW()  -- Only active promotions
  ORDER BY
    distance ASC;
END;
$$ LANGUAGE plpgsql;