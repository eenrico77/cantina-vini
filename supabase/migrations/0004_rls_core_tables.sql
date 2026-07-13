-- RLS for core tables: wines, bottles, cellars

ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cellars ENABLE ROW LEVEL SECURITY;

-- Policies for wines
CREATE POLICY "Users can view their own wines" ON wines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wines" ON wines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wines" ON wines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wines" ON wines FOR DELETE USING (auth.uid() = user_id);

-- Policies for bottles
CREATE POLICY "Users can view their own bottles" ON bottles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bottles" ON bottles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bottles" ON bottles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bottles" ON bottles FOR DELETE USING (auth.uid() = user_id);

-- Policies for cellars
CREATE POLICY "Users can view their own cellars" ON cellars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cellars" ON cellars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cellars" ON cellars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cellars" ON cellars FOR DELETE USING (auth.uid() = user_id);
