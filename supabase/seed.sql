-- VAD Seed Data
-- Populate with initial algorithm data from scraped JSON files

-- Additional algorithms from theory
INSERT INTO algorithms (name, slug, category, description) VALUES
    ('Linear Regression', 'linear-regression', 'Supervised Learning', 'Models linear relationship between dependent and independent variables'),
    ('Decision Trees', 'decision-trees', 'Supervised Learning', 'Tree-structured classifier/regressor using feature-based splits'),
    ('Random Forest', 'random-forest', 'Supervised Learning', 'Ensemble of decision trees trained on random subsets of data'),
    ('Support Vector Machines', 'svm', 'Supervised Learning', 'Finds optimal hyperplane to separate classes with maximum margin'),
    ('Neural Networks', 'neural-networks', 'Supervised Learning', 'Layered architecture of neurons learning hierarchical representations'),
    ('Hierarchical Clustering', 'hierarchical-clustering', 'Unsupervised Learning', 'Builds nested clusters by merging or splitting based on distance'),
    ('PCA', 'pca', 'Unsupervised Learning', 'Reduces dimensionality by projecting data onto principal components'),
    ('Autoencoders', 'autoencoders', 'Unsupervised Learning', 'Neural networks that learn compressed representations of data'),
    ('Q-Learning', 'q-learning', 'Reinforcement Learning', 'Model-free RL algorithm that learns optimal action-value function'),
    ('Policy Gradient', 'policy-gradient', 'Reinforcement Learning', 'Directly optimizes policy by following gradient of expected reward'),
    ('Gradient Descent', 'gradient-descent', 'Optimization', 'Iterative optimization algorithm following negative gradient'),
    ('Evolutionary Algorithms', 'evolutionary-algorithms', 'Optimization', 'Population-based optimization inspired by natural selection'),
    ('Grid Search', 'grid-search', 'H2O Platform', 'Exhaustive parameter search over specified grid of values'),
    ('SHAP', 'shap', 'H2O Platform', 'SHapley Additive exPlanations for model interpretability'),
    ('LIME', 'lime', 'H2O Platform', 'Local Interpretable Model-agnostic Explanations for black-box models')
ON CONFLICT (slug) DO NOTHING;

-- Node templates for canvas spatial
INSERT INTO node_templates (name, node_type, category, description, color) VALUES
    ('Data Source', 'input', 'data', 'Point d''entrée des données', '#4FC3F7'),
    ('Algorithm', 'process', 'compute', 'Nœud de traitement algorithmique', '#FFB74D'),
    ('Output', 'output', 'data', 'Résultat ou sortie', '#81C784'),
    ('Parameter', 'config', 'config', 'Configuration et hyperparamètres', '#CE93D8'),
    ('Split', 'flow', 'flow', 'Division du flux de données', '#90A4AE'),
    ('Merge', 'flow', 'flow', 'Fusion de flux de données', '#A1887F'),
    ('Validation', 'evaluate', 'evaluate', 'Évaluation et métriques', '#EF5350'),
    ('Visualization', 'output', 'visualize', 'Visualisation des résultats', '#26C6DA');
