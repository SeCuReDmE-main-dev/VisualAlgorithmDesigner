-- ============================================================
-- VAD (Visual Algorithm Designer) — Schéma Initial
-- Supabase Local — Migrations
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: algorithms
-- Algorithmes connus (top-10, théorie ML, annexe H2O-3)
-- ============================================================
CREATE TABLE algorithms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    how_it_works TEXT,
    complexity_time TEXT,
    complexity_space TEXT,
    real_world_examples JSONB DEFAULT '[]',
    key_parameters JSONB DEFAULT '[]',
    pros_cons JSONB DEFAULT '{}',
    related_algorithms TEXT[] DEFAULT '{}',
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_algorithms_category ON algorithms(category);
CREATE INDEX idx_algorithms_slug ON algorithms(slug);

-- ============================================================
-- Table: h2o_params
-- Paramètres documentés de H2O-3
-- ============================================================
CREATE TABLE h2o_params (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    param_name TEXT NOT NULL UNIQUE,
    description TEXT,
    param_type TEXT DEFAULT 'parameter',
    supported_algos TEXT[] DEFAULT '{}',
    r_example TEXT,
    python_example TEXT,
    default_value TEXT,
    typical_range JSONB,
    related_params TEXT[] DEFAULT '{}',
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_h2o_params_name ON h2o_params(param_name);
CREATE INDEX idx_h2o_params_type ON h2o_params(param_type);

-- ============================================================
-- Table: algorithm_categories
-- Catégories d'algorithmes pour navigation
-- ============================================================
CREATE TABLE algorithm_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES algorithm_categories(id),
    sort_order INT DEFAULT 0
);

-- Insert default categories
INSERT INTO algorithm_categories (name, slug, description, sort_order) VALUES
    ('Search', 'search', 'Algorithmes de recherche et classement', 1),
    ('Recommendation', 'recommendation', 'Systèmes de recommandation et filtrage', 2),
    ('Machine Learning', 'machine-learning', 'Algorithmes d''apprentissage automatique', 3),
    ('Clustering', 'clustering', 'Algorithmes de partitionnement', 4),
    ('Cryptography', 'cryptography', 'Algorithmes de chiffrement et sécurité', 5),
    ('Data Structures', 'data-structures', 'Structures de données spécialisées', 6),
    ('Distributed Computing', 'distributed', 'Algorithmes de calcul distribué', 7),
    ('Optimization', 'optimization', 'Algorithmes d''optimisation', 8),
    ('Reinforcement Learning', 'reinforcement-learning', 'Apprentissage par renforcement', 9),
    ('Supervised Learning', 'supervised-learning', 'Apprentissage supervisé', 10),
    ('Unsupervised Learning', 'unsupervised-learning', 'Apprentissage non supervisé', 11),
    ('Explainability', 'explainability', 'Outils pour expliquer et comparer les décisions algorithmiques', 12);

-- ============================================================
-- Table: projects
-- Projets VAD créés par les utilisateurs
-- ============================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_user ON projects(user_id);

-- ============================================================
-- Table: node_templates
-- Templates de nœuds réutilisables pour le canvas spatial
-- ============================================================
CREATE TABLE node_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    node_type TEXT NOT NULL,
    category TEXT,
    description TEXT,
    parameters JSONB DEFAULT '{}',
    algorithm_id UUID REFERENCES algorithms(id),
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_node_templates_type ON node_templates(node_type);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE h2o_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE algorithm_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_templates ENABLE ROW LEVEL SECURITY;

-- Public tables: lecture ouverte, écriture réservée
CREATE POLICY "Public read access" ON algorithms
    FOR SELECT USING (true);

CREATE POLICY "Public read access" ON h2o_params
    FOR SELECT USING (true);

CREATE POLICY "Public read access" ON algorithm_categories
    FOR SELECT USING (true);

CREATE POLICY "Public read access" ON node_templates
    FOR SELECT USING (true);

-- Projects: lecture/écriture limitée au propriétaire
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public projects" ON projects
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Seed: populate algorithms from top-10 and theory files
-- ============================================================
-- Note: These seeds mirror the JSON files in data/algorithms/
-- The full population will be done by a script reading the JSON files.
-- Here we seed a few key entries for immediate testing.

INSERT INTO algorithms (name, slug, category, description) VALUES
    ('PageRank', 'pagerank', 'Search', 'Google''s algorithm for ranking web pages based on link structure'),
    ('Collaborative Filtering', 'collaborative-filtering', 'Recommendation', 'Algorithm for recommending items based on similar users or items'),
    ('Gradient Boosting', 'gradient-boosting', 'Machine Learning', 'Ensemble technique that builds models sequentially to correct errors'),
    ('k-Means Clustering', 'k-means', 'Clustering', 'Partitions data into k clusters by minimizing within-cluster variance'),
    ('A* Pathfinding', 'astar', 'Search', 'Finds shortest path between nodes using heuristic-guided search'),
    ('RSA Encryption', 'rsa', 'Cryptography', 'Public-key cryptosystem for secure data transmission'),
    ('Bloom Filter', 'bloom-filter', 'Data Structures', 'Space-efficient probabilistic data structure for set membership'),
    ('MapReduce', 'mapreduce', 'Distributed Computing', 'Programming model for processing large datasets in parallel'),
    ('Backpropagation', 'backpropagation', 'Machine Learning', 'Algorithm for training neural networks via gradient computation'),
    ('Trie', 'trie', 'Data Structures', 'Tree-like data structure for efficient string prefix matching')
ON CONFLICT (slug) DO NOTHING;
