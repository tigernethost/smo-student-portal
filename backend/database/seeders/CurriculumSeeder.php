<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('subjects')->count() > 0) {
            $this->command->info('Curriculum already seeded. Skipping.');
            return;
        }

        $now = now();

        $subjects = [
            // CORE SUBJECTS
            ['name'=>'Mathematics','code'=>'MATH','icon'=>'📐','color'=>'#2563eb','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Number Sense & Numeration','quarter'=>1,'description'=>'Integers, fractions, decimals, and number systems'],
                ['name'=>'Ratio, Proportion & Percent','quarter'=>1,'description'=>'Solving ratio and proportion problems'],
                ['name'=>'Algebraic Expressions','quarter'=>1,'description'=>'Translating verbal phrases, simplifying expressions'],
                ['name'=>'Linear Equations','quarter'=>2,'description'=>'Solving and graphing linear equations'],
                ['name'=>'Linear Inequalities','quarter'=>2,'description'=>'Solving inequalities and graphing on a number line'],
                ['name'=>'Systems of Linear Equations','quarter'=>2,'description'=>'Substitution, elimination, and graphing methods'],
                ['name'=>'Functions & Relations','quarter'=>2,'description'=>'Domain, range, function notation'],
                ['name'=>'Geometry – Lines & Angles','quarter'=>3,'description'=>'Basic geometric concepts and postulates'],
                ['name'=>'Triangles & Congruence','quarter'=>3,'description'=>'SSS, SAS, ASA, AAS congruence theorems'],
                ['name'=>'Quadrilaterals & Polygons','quarter'=>3,'description'=>'Properties of parallelograms and other polygons'],
                ['name'=>'Circles & Arcs','quarter'=>3,'description'=>'Chords, tangents, arcs, and inscribed angles'],
                ['name'=>'Statistics – Data Collection','quarter'=>4,'description'=>'Sampling methods and frequency distributions'],
                ['name'=>'Measures of Central Tendency','quarter'=>4,'description'=>'Mean, median, mode, and weighted averages'],
                ['name'=>'Probability','quarter'=>4,'description'=>'Theoretical and experimental probability'],
                ['name'=>'Problem Solving Strategies','quarter'=>4,'description'=>'Word problems and mathematical reasoning'],
            ]],
            ['name'=>'English Language Arts','code'=>'ENG','icon'=>'📖','color'=>'#7c3aed','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Grammar – Parts of Speech','quarter'=>1,'description'=>'Nouns, verbs, adjectives, adverbs, and pronouns'],
                ['name'=>'Grammar – Sentence Structure','quarter'=>1,'description'=>'Simple, compound, complex sentences'],
                ['name'=>'Vocabulary Development','quarter'=>1,'description'=>'Context clues, word roots, prefixes and suffixes'],
                ['name'=>'Reading Comprehension – Fiction','quarter'=>1,'description'=>'Plot, character, setting, theme, and point of view'],
                ['name'=>'Literary Devices & Figurative Language','quarter'=>2,'description'=>'Simile, metaphor, imagery, personification'],
                ['name'=>'Poetry Analysis','quarter'=>2,'description'=>'Meter, rhyme, tone, mood, and poetic forms'],
                ['name'=>'Drama & Play Analysis','quarter'=>2,'description'=>'Elements of drama, conflict, and resolution'],
                ['name'=>'Non-Fiction & Informational Text','quarter'=>2,'description'=>'Main idea, text structure, and evaluating sources'],
                ['name'=>'Expository Writing','quarter'=>3,'description'=>'Essay structure and paragraph development'],
                ['name'=>'Persuasive & Argumentative Writing','quarter'=>3,'description'=>'Claims, evidence, and logical fallacies'],
                ['name'=>'Research Writing & Citation','quarter'=>3,'description'=>'MLA/APA format, paraphrasing, and plagiarism'],
                ['name'=>'Oral Communication & Public Speaking','quarter'=>4,'description'=>'Speech delivery and audience awareness'],
                ['name'=>'Listening Comprehension','quarter'=>4,'description'=>'Active listening and note-taking'],
                ['name'=>'Media Literacy','quarter'=>4,'description'=>'Evaluating media sources and fake news'],
            ]],
            ['name'=>'Science','code'=>'SCI','icon'=>'🔬','color'=>'#059669','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Scientific Method & Lab Safety','quarter'=>1,'description'=>'Hypothesis, experiment design, and safety rules'],
                ['name'=>'Matter & Its Properties','quarter'=>1,'description'=>'Physical vs chemical properties and states of matter'],
                ['name'=>'Atomic Structure','quarter'=>1,'description'=>'Protons, neutrons, electrons, and atomic number'],
                ['name'=>'Periodic Table & Elements','quarter'=>1,'description'=>'Periods, groups, metals, and non-metals'],
                ['name'=>'Chemical Bonding','quarter'=>2,'description'=>'Ionic, covalent, and metallic bonds'],
                ['name'=>'Chemical Reactions & Equations','quarter'=>2,'description'=>'Balancing equations and types of reactions'],
                ['name'=>'Acids, Bases & Salts','quarter'=>2,'description'=>'pH scale and neutralization reactions'],
                ['name'=>'Forces & Newton\'s Laws','quarter'=>3,'description'=>'Inertia, acceleration, and action-reaction'],
                ['name'=>'Energy – Kinetic & Potential','quarter'=>3,'description'=>'Conservation of energy, work, and power'],
                ['name'=>'Waves, Sound & Light','quarter'=>3,'description'=>'Wave properties and electromagnetic spectrum'],
                ['name'=>'Ecosystems & Biodiversity','quarter'=>4,'description'=>'Food webs, biomes, and ecological relationships'],
                ['name'=>'Cell Biology & Cell Processes','quarter'=>4,'description'=>'Cell structure, mitosis, meiosis'],
                ['name'=>'Genetics & Heredity','quarter'=>4,'description'=>'Mendelian genetics and Punnett squares'],
                ['name'=>'Earth & Plate Tectonics','quarter'=>4,'description'=>'Continental drift, earthquakes, and volcanoes'],
            ]],
            ['name'=>'Filipino','code'=>'FIL','icon'=>'🇵🇭','color'=>'#d97706','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Gramatika – Bahagi ng Pananalita','quarter'=>1,'description'=>'Pangngalan, pandiwa, pang-uri, pang-abay'],
                ['name'=>'Estruktura ng Pangungusap','quarter'=>1,'description'=>'Paksa, panaguri, at uri ng pangungusap'],
                ['name'=>'Pag-unawa sa Binasang Teksto','quarter'=>1,'description'=>'Pangunahing ideya at pagsusuri ng teksto'],
                ['name'=>'Pagsulat ng Sanaysay','quarter'=>2,'description'=>'Pagsulat ng panimula, katawan, at wakas'],
                ['name'=>'Panitikang Pilipino','quarter'=>2,'description'=>'Pagsusuri ng tula, maikling kwento, at nobela'],
                ['name'=>'Dula at Malikhaing Pagsulat','quarter'=>3,'description'=>'Pagsulat ng dula, kuwento, at malikhaing akda'],
                ['name'=>'Oral na Komunikasyon','quarter'=>3,'description'=>'Pagbibigay-talumpati at oral na presentasyon'],
                ['name'=>'Pananaliksik at Kritikal na Pagbabasa','quarter'=>4,'description'=>'Pamamaraan ng pananaliksik at pagsulat ng ulat'],
            ]],
            ['name'=>'Araling Panlipunan','code'=>'AP','icon'=>'🌏','color'=>'#dc2626','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Kasaysayan – Sinaunang Panahon','quarter'=>1,'description'=>'Sinaunang kabihasnan at Barangay system'],
                ['name'=>'Kolonyalismo at Rebolusyon','quarter'=>1,'description'=>'Espanyol, Amerikano, Hapon at Rebolusyong Pilipino'],
                ['name'=>'Pagkamamamayan at Pamahalaan','quarter'=>2,'description'=>'Konstitusyon, karapatan, at tatlong sangay'],
                ['name'=>'Ekonomiya ng Pilipinas','quarter'=>3,'description'=>'GDP, inflation, supply at demand'],
                ['name'=>'Heograpiya ng Asya','quarter'=>3,'description'=>'Mapa, klima, at likas na yaman'],
                ['name'=>'Kultura at Lipunan','quarter'=>3,'description'=>'Pagpapahalaga at tradisyon ng Pilipino'],
                ['name'=>'Pandaigdigang Kasaysayan','quarter'=>4,'description'=>'World Wars, Cold War, at pandaigdigang kilusan'],
                ['name'=>'Kontemporaryong Isyu','quarter'=>4,'description'=>'ASEAN, climate change, at human rights'],
            ]],
            ['name'=>'Edukasyon sa Pagpapakatao','code'=>'ESP','icon'=>'🌟','color'=>'#9333ea','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Pag-unlad ng Sarili','quarter'=>1,'description'=>'Pagkilala sa sarili at positibong kaisipan'],
                ['name'=>'Pamilya at Relasyon','quarter'=>2,'description'=>'Pagpapahalaga sa pamilya at pakikipagkapwa'],
                ['name'=>'Sibikong Responsibilidad','quarter'=>3,'description'=>'Pagmamalasakit sa komunidad at kalikasan'],
                ['name'=>'Etika at Moral na Pagpapasya','quarter'=>4,'description'=>'Etikong pag-iisip at virtues'],
            ]],
            ['name'=>'TLE / EPP','code'=>'TLE','icon'=>'🔧','color'=>'#0891b2','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Entrepreneurship Basics','quarter'=>1,'description'=>'Business ideas, SWOT analysis'],
                ['name'=>'ICT Fundamentals','quarter'=>1,'description'=>'Hardware, software, and troubleshooting'],
                ['name'=>'Productivity Applications','quarter'=>1,'description'=>'Word processing, spreadsheets, presentations'],
                ['name'=>'Home Economics','quarter'=>2,'description'=>'Food preparation, nutrition, and safety'],
                ['name'=>'Agriculture Basics','quarter'=>2,'description'=>'Crop production and soil management'],
                ['name'=>'Industrial Arts','quarter'=>3,'description'=>'Woodworking, electrical basics'],
                ['name'=>'Business & Marketing','quarter'=>4,'description'=>'Marketing mix and customer service'],
            ]],
            ['name'=>'MAPEH','code'=>'MAPEH','icon'=>'🎨','color'=>'#db2777','grade_level'=>null,'track'=>'Core','topics'=>[
                ['name'=>'Music – Theory & Notation','quarter'=>1,'description'=>'Notes, rests, time signatures, and scales'],
                ['name'=>'Arts – Elements & Principles','quarter'=>1,'description'=>'Line, shape, color, texture, and balance'],
                ['name'=>'PE – Team Sports','quarter'=>2,'description'=>'Basketball, volleyball, and football skills'],
                ['name'=>'Health – Personal Wellness','quarter'=>2,'description'=>'Nutrition, sleep, and disease prevention'],
                ['name'=>'Music – Philippine Folk Music','quarter'=>3,'description'=>'Kundiman, folk songs, and regional traditions'],
                ['name'=>'Arts – Visual Arts & Crafts','quarter'=>3,'description'=>'Drawing, painting, and Philippine crafts'],
                ['name'=>'PE – Individual Sports & Fitness','quarter'=>4,'description'=>'Track and field and fitness testing'],
                ['name'=>'Health – Community Health','quarter'=>4,'description'=>'Public health and environmental issues'],
            ]],

            // GRADE 11-12 CORE
            ['name'=>'Oral Communication in Context','code'=>'OCC','icon'=>'🎤','color'=>'#6366f1','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Nature & Elements of Communication','quarter'=>1,'description'=>'Communication process, models, and barriers'],
                ['name'=>'Varieties of Spoken Language','quarter'=>1,'description'=>'Registers, dialects, and contextual language'],
                ['name'=>'Speech Acts & Communication Strategies','quarter'=>2,'description'=>'Illocutionary acts and conversational repair'],
                ['name'=>'Public Speaking & Presentations','quarter'=>2,'description'=>'Impromptu and prepared speeches'],
                ['name'=>'Listening & Critical Evaluation','quarter'=>3,'description'=>'Active listening and evaluating speeches'],
                ['name'=>'Debates & Academic Discussions','quarter'=>4,'description'=>'Parliamentary debate and Socratic seminar'],
            ]],
            ['name'=>'General Mathematics','code'=>'GENMATH','icon'=>'🧮','color'=>'#2563eb','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Functions & Their Graphs','quarter'=>1,'description'=>'Evaluating and graphing functions'],
                ['name'=>'Rational Functions','quarter'=>1,'description'=>'Domain, asymptotes, and graphing'],
                ['name'=>'Exponential Functions','quarter'=>2,'description'=>'Growth, decay, and equations'],
                ['name'=>'Logarithmic Functions','quarter'=>2,'description'=>'Log laws and solving equations'],
                ['name'=>'Simple & Compound Interest','quarter'=>3,'description'=>'Interest formulas and present/future value'],
                ['name'=>'Annuities & Loans','quarter'=>3,'description'=>'Amortization and loan computation'],
                ['name'=>'Stocks, Bonds & Investment','quarter'=>3,'description'=>'Market value, dividends, and yield'],
                ['name'=>'Propositional Logic','quarter'=>4,'description'=>'Propositions, connectives, and truth tables'],
                ['name'=>'Methods of Proof','quarter'=>4,'description'=>'Direct proof and mathematical induction'],
            ]],
            ['name'=>'Statistics & Probability','code'=>'STATPROB','icon'=>'📊','color'=>'#10b981','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Random Variables & Distributions','quarter'=>1,'description'=>'Discrete and continuous random variables'],
                ['name'=>'Normal Distribution','quarter'=>1,'description'=>'z-scores and area under the curve'],
                ['name'=>'Sampling Distributions','quarter'=>2,'description'=>'CLT and sampling distribution of the mean'],
                ['name'=>'Confidence Intervals','quarter'=>3,'description'=>'Point estimates and margin of error'],
                ['name'=>'Hypothesis Testing','quarter'=>3,'description'=>'Null hypothesis, t-test, z-test, p-values'],
                ['name'=>'Correlation & Regression','quarter'=>4,'description'=>'Pearson r, scatter plots, and linear regression'],
            ]],
            ['name'=>'Earth and Life Science','code'=>'ELS','icon'=>'🌍','color'=>'#059669','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Origin of the Universe','quarter'=>1,'description'=>'Big Bang theory and stellar evolution'],
                ['name'=>'Earth\'s Structure & Composition','quarter'=>1,'description'=>'Layers of the Earth, minerals, and rocks'],
                ['name'=>'Plate Tectonics & Hazards','quarter'=>2,'description'=>'Plate boundaries, earthquakes, and volcanoes'],
                ['name'=>'Atmosphere & Climate','quarter'=>2,'description'=>'Weather systems and climate change'],
                ['name'=>'Origin of Life & Evolution','quarter'=>3,'description'=>'Natural selection and speciation'],
                ['name'=>'Biodiversity & Ecosystems','quarter'=>3,'description'=>'Classification, biomes, and ecological services'],
                ['name'=>'Human Impact & Conservation','quarter'=>4,'description'=>'Pollution, deforestation, and sustainability'],
            ]],
            ['name'=>'Personal Development','code'=>'PERDEV','icon'=>'💪','color'=>'#8b5cf6','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Self-Concept & Personal Identity','quarter'=>1,'description'=>'Self-awareness, Johari window, and personal values'],
                ['name'=>'Developmental Tasks & Challenges','quarter'=>1,'description'=>'Adolescent development and peer pressure'],
                ['name'=>'Emotional Intelligence & Mental Health','quarter'=>2,'description'=>'Managing emotions and promoting mental wellness'],
                ['name'=>'Study Habits & Career Planning','quarter'=>2,'description'=>'Time management and career decision-making'],
            ]],
            ['name'=>'Understanding Culture, Society & Politics','code'=>'UCSP','icon'=>'🌐','color'=>'#ec4899','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Anthropological Perspectives on Culture','quarter'=>1,'description'=>'Cultural relativism and ethnocentrism'],
                ['name'=>'Sociological Perspectives on Society','quarter'=>1,'description'=>'Social institutions and stratification'],
                ['name'=>'Political Science & Government','quarter'=>2,'description'=>'Forms of government and political ideologies'],
                ['name'=>'Social Issues & Change','quarter'=>2,'description'=>'Social movements and globalization'],
            ]],
            ['name'=>'Komunikasyon at Pananaliksik','code'=>'KP','icon'=>'📝','color'=>'#f59e0b','grade_level'=>11,'track'=>'Core','topics'=>[
                ['name'=>'Wika at Lipunan','quarter'=>1,'description'=>'Kasaysayan ng Filipino at varasyong linggwistika'],
                ['name'=>'Akademikong Pagsulat','quarter'=>2,'description'=>'Akademikong sanaysay at persuasibong sulatin'],
                ['name'=>'Disenyo ng Pananaliksik','quarter'=>3,'description'=>'Qualitative at quantitative na pananaliksik'],
                ['name'=>'Pagsulat ng Pananaliksik','quarter'=>4,'description'=>'IMRaD format at pagtatanggol ng pananaliksik'],
            ]],

            // STEM STRAND
            ['name'=>'Pre-Calculus','code'=>'PRECAL','icon'=>'∫','color'=>'#1d4ed8','grade_level'=>11,'track'=>'STEM','topics'=>[
                ['name'=>'Conic Sections – Parabola','quarter'=>1,'description'=>'Equation, focus, directrix, and graphing'],
                ['name'=>'Conic Sections – Ellipse & Hyperbola','quarter'=>1,'description'=>'Standard form, vertices, and asymptotes'],
                ['name'=>'Series & Mathematical Induction','quarter'=>2,'description'=>'Sigma notation and arithmetic/geometric series'],
                ['name'=>'Polynomial & Rational Functions','quarter'=>2,'description'=>'Synthetic division and remainder theorem'],
                ['name'=>'Trigonometric Functions','quarter'=>3,'description'=>'Unit circle, sine, cosine, tangent'],
                ['name'=>'Trigonometric Identities','quarter'=>3,'description'=>'Pythagorean and double-angle identities'],
                ['name'=>'Inverse Trigonometric Functions','quarter'=>4,'description'=>'Arcsin, arccos, arctan'],
                ['name'=>'Polar Coordinates & Complex Numbers','quarter'=>4,'description'=>'Polar form and De Moivre\'s theorem'],
            ]],
            ['name'=>'Basic Calculus','code'=>'CALCULUS','icon'=>'∂','color'=>'#1e40af','grade_level'=>12,'track'=>'STEM','topics'=>[
                ['name'=>'Limits & Continuity','quarter'=>1,'description'=>'Limit theorems and continuity'],
                ['name'=>'Derivatives – Definition & Rules','quarter'=>1,'description'=>'Power rule, product and quotient rules'],
                ['name'=>'Chain Rule & Implicit Differentiation','quarter'=>2,'description'=>'Composite functions and implicit differentiation'],
                ['name'=>'Applications of Derivatives','quarter'=>2,'description'=>'Maxima, minima, and optimization'],
                ['name'=>'Integration – Anti-differentiation','quarter'=>3,'description'=>'Indefinite integrals and u-substitution'],
                ['name'=>'Definite Integrals & Fundamental Theorem','quarter'=>3,'description'=>'Riemann sums and area under curve'],
                ['name'=>'Applications of Integration','quarter'=>4,'description'=>'Area between curves and volumes'],
            ]],
            ['name'=>'General Physics 1','code'=>'PHYS1','icon'=>'⚛️','color'=>'#0369a1','grade_level'=>11,'track'=>'STEM','topics'=>[
                ['name'=>'Units, Measurement & Vectors','quarter'=>1,'description'=>'SI units and vector addition'],
                ['name'=>'Kinematics – 1D Motion','quarter'=>1,'description'=>'Displacement, velocity, acceleration, and free fall'],
                ['name'=>'Kinematics – 2D & Projectiles','quarter'=>2,'description'=>'Projectile motion and circular motion'],
                ['name'=>'Newton\'s Laws & Applications','quarter'=>2,'description'=>'Free body diagrams and inclined planes'],
                ['name'=>'Work, Energy & Power','quarter'=>3,'description'=>'Work-energy theorem and conservation of energy'],
                ['name'=>'Momentum & Impulse','quarter'=>3,'description'=>'Conservation of momentum and collisions'],
                ['name'=>'Rotational Motion & Torque','quarter'=>4,'description'=>'Angular kinematics and moment of inertia'],
                ['name'=>'Fluid Mechanics','quarter'=>4,'description'=>'Pressure, buoyancy, and Bernoulli\'s principle'],
            ]],
            ['name'=>'General Physics 2','code'=>'PHYS2','icon'=>'⚡','color'=>'#075985','grade_level'=>12,'track'=>'STEM','topics'=>[
                ['name'=>'Electric Charge & Coulomb\'s Law','quarter'=>1,'description'=>'Electric force and field lines'],
                ['name'=>'Electric Potential & Capacitance','quarter'=>1,'description'=>'Potential difference and capacitors'],
                ['name'=>'DC Circuits & Ohm\'s Law','quarter'=>2,'description'=>'Kirchhoff\'s laws and series/parallel circuits'],
                ['name'=>'Magnetism & Electromagnetic Induction','quarter'=>2,'description'=>'Magnetic force and Faraday\'s law'],
                ['name'=>'Optics – Reflection & Refraction','quarter'=>3,'description'=>'Mirrors, lenses, and Snell\'s law'],
                ['name'=>'Modern Physics – Quantum & Nuclear','quarter'=>4,'description'=>'Photoelectric effect and radioactivity'],
            ]],
            ['name'=>'General Chemistry 1','code'=>'CHEM1','icon'=>'⚗️','color'=>'#065f46','grade_level'=>11,'track'=>'STEM','topics'=>[
                ['name'=>'Atomic Structure & Quantum Numbers','quarter'=>1,'description'=>'Electron configuration and quantum numbers'],
                ['name'=>'Chemical Bonding & Molecular Geometry','quarter'=>1,'description'=>'VSEPR theory and hybridization'],
                ['name'=>'Stoichiometry & Mole Concept','quarter'=>2,'description'=>'Molar mass and limiting reagents'],
                ['name'=>'Gas Laws','quarter'=>2,'description'=>'Boyle\'s, Charles\', and ideal gas law'],
                ['name'=>'Chemical Thermodynamics','quarter'=>3,'description'=>'Enthalpy, entropy, and Gibbs free energy'],
                ['name'=>'Chemical Kinetics','quarter'=>4,'description'=>'Reaction rates and activation energy'],
            ]],
            ['name'=>'General Chemistry 2','code'=>'CHEM2','icon'=>'🧪','color'=>'#047857','grade_level'=>12,'track'=>'STEM','topics'=>[
                ['name'=>'Chemical Equilibrium','quarter'=>1,'description'=>'Equilibrium constants and Le Chatelier\'s principle'],
                ['name'=>'Acids, Bases & Buffers','quarter'=>1,'description'=>'pH, buffer solutions, and titration'],
                ['name'=>'Electrochemistry','quarter'=>2,'description'=>'Galvanic cells and electrolysis'],
                ['name'=>'Organic Chemistry – Hydrocarbons','quarter'=>3,'description'=>'Alkanes, alkenes, alkynes, and IUPAC nomenclature'],
                ['name'=>'Organic Chemistry – Functional Groups','quarter'=>3,'description'=>'Alcohols, aldehydes, ketones, and esters'],
                ['name'=>'Biochemistry Basics','quarter'=>4,'description'=>'Carbohydrates, lipids, proteins, and nucleic acids'],
            ]],
            ['name'=>'Biology 1','code'=>'BIO1','icon'=>'🧬','color'=>'#166534','grade_level'=>11,'track'=>'STEM','topics'=>[
                ['name'=>'Cell Structure & Cell Theory','quarter'=>1,'description'=>'Organelles and prokaryotic vs eukaryotic cells'],
                ['name'=>'Cell Membrane & Transport','quarter'=>1,'description'=>'Diffusion, osmosis, and active transport'],
                ['name'=>'Cellular Respiration & Photosynthesis','quarter'=>2,'description'=>'Glycolysis, Krebs cycle, and light reactions'],
                ['name'=>'Cell Division – Mitosis & Meiosis','quarter'=>2,'description'=>'Stages and significance of cell division'],
                ['name'=>'Mendelian Genetics','quarter'=>3,'description'=>'Laws of segregation and Punnett squares'],
                ['name'=>'Non-Mendelian Inheritance','quarter'=>3,'description'=>'Incomplete dominance and sex-linked traits'],
                ['name'=>'Molecular Genetics – DNA & RNA','quarter'=>4,'description'=>'DNA replication, transcription, translation'],
                ['name'=>'Biotechnology','quarter'=>4,'description'=>'PCR, gel electrophoresis, CRISPR, and GMOs'],
            ]],
            ['name'=>'Biology 2','code'=>'BIO2','icon'=>'🌿','color'=>'#15803d','grade_level'=>12,'track'=>'STEM','topics'=>[
                ['name'=>'Evolution & Natural Selection','quarter'=>1,'description'=>'Darwin\'s theory and mechanisms of evolution'],
                ['name'=>'Taxonomy & Biodiversity','quarter'=>1,'description'=>'Classification system and phylogeny'],
                ['name'=>'Ecology – Populations & Communities','quarter'=>2,'description'=>'Population dynamics and succession'],
                ['name'=>'Ecosystem Dynamics & Cycles','quarter'=>2,'description'=>'Energy flow and biogeochemical cycles'],
                ['name'=>'Plant Biology & Physiology','quarter'=>3,'description'=>'Plant structure, transpiration, and reproduction'],
                ['name'=>'Animal Physiology – Systems','quarter'=>3,'description'=>'Nervous, endocrine, and immune systems'],
                ['name'=>'Human Biology & Diseases','quarter'=>4,'description'=>'Major diseases and public health'],
            ]],

            // ABM STRAND
            ['name'=>'Fundamentals of ABM 1','code'=>'FABM1','icon'=>'📒','color'=>'#854d0e','grade_level'=>11,'track'=>'ABM','topics'=>[
                ['name'=>'Introduction to Accountancy','quarter'=>1,'description'=>'History and users of financial information'],
                ['name'=>'Accounting Concepts & Principles','quarter'=>1,'description'=>'GAAP, going concern, and accrual basis'],
                ['name'=>'Accounting Equation','quarter'=>1,'description'=>'Assets, liabilities, equity, and transactions'],
                ['name'=>'Journalizing Transactions','quarter'=>2,'description'=>'Journal entries and double-entry bookkeeping'],
                ['name'=>'Posting to Ledger','quarter'=>2,'description'=>'T-accounts and general ledger'],
                ['name'=>'Trial Balance','quarter'=>3,'description'=>'Preparing and interpreting the trial balance'],
                ['name'=>'Adjusting Entries','quarter'=>3,'description'=>'Accruals, deferrals, and depreciation'],
                ['name'=>'Financial Statements','quarter'=>4,'description'=>'Income statement, balance sheet, cash flows'],
            ]],
            ['name'=>'Fundamentals of ABM 2','code'=>'FABM2','icon'=>'📊','color'=>'#92400e','grade_level'=>12,'track'=>'ABM','topics'=>[
                ['name'=>'Cash & Bank Reconciliation','quarter'=>1,'description'=>'Bank reconciliation and petty cash'],
                ['name'=>'Receivables & Bad Debts','quarter'=>1,'description'=>'Accounts receivable and allowance method'],
                ['name'=>'Inventories','quarter'=>2,'description'=>'FIFO, LIFO, and weighted average'],
                ['name'=>'Property, Plant & Equipment','quarter'=>2,'description'=>'Cost model, depreciation, and impairment'],
                ['name'=>'Payables & Liabilities','quarter'=>3,'description'=>'Accounts payable and accrued liabilities'],
                ['name'=>'Financial Statement Analysis','quarter'=>4,'description'=>'Ratio analysis and trend analysis'],
            ]],
            ['name'=>'Business Mathematics','code'=>'BUSMATH','icon'=>'💹','color'=>'#78350f','grade_level'=>11,'track'=>'ABM','topics'=>[
                ['name'=>'Percent & Discount in Business','quarter'=>1,'description'=>'Markup, markdown, and discount calculations'],
                ['name'=>'Simple & Compound Interest','quarter'=>2,'description'=>'Interest computation and present/future value'],
                ['name'=>'Annuities & Loans','quarter'=>2,'description'=>'Amortization and sinking funds'],
                ['name'=>'Profit & Loss Analysis','quarter'=>3,'description'=>'Break-even and cost-volume-profit analysis'],
                ['name'=>'Business Statistics','quarter'=>4,'description'=>'Descriptive statistics and time series'],
            ]],
            ['name'=>'Principles of Marketing','code'=>'MKTG','icon'=>'📣','color'=>'#dc2626','grade_level'=>12,'track'=>'ABM','topics'=>[
                ['name'=>'Marketing Concepts & Environment','quarter'=>1,'description'=>'Marketing mix and consumer behavior'],
                ['name'=>'Market Research & Segmentation','quarter'=>2,'description'=>'Targeting, positioning, and research methods'],
                ['name'=>'Product & Pricing Strategy','quarter'=>3,'description'=>'Product lifecycle, branding, and pricing'],
                ['name'=>'Distribution & Promotion','quarter'=>4,'description'=>'Channels, advertising, and digital marketing'],
            ]],

            // HUMSS STRAND
            ['name'=>'Creative Nonfiction','code'=>'CNF','icon'=>'✍️','color'=>'#7c3aed','grade_level'=>11,'track'=>'HUMSS','topics'=>[
                ['name'=>'Introduction to Creative Nonfiction','quarter'=>1,'description'=>'Subgenres and characteristics of CNF'],
                ['name'=>'Personal Essay & Memoir','quarter'=>1,'description'=>'Writing personal narratives and reflective essays'],
                ['name'=>'Feature Writing & Journalism','quarter'=>2,'description'=>'News writing and interviewing techniques'],
                ['name'=>'Literary Journalism','quarter'=>3,'description'=>'Blending facts with narrative storytelling'],
                ['name'=>'Essay Workshop & Publication','quarter'=>4,'description'=>'Peer review, revision, and publication'],
            ]],
            ['name'=>'World Religions & Belief Systems','code'=>'IWRBS','icon'=>'☮️','color'=>'#9333ea','grade_level'=>11,'track'=>'HUMSS','topics'=>[
                ['name'=>'Nature of Religion & Spirituality','quarter'=>1,'description'=>'Sacred vs profane, ritual, and religious experience'],
                ['name'=>'Eastern Religions','quarter'=>1,'description'=>'Hinduism, Buddhism, and their core beliefs'],
                ['name'=>'Abrahamic Religions','quarter'=>2,'description'=>'Judaism, Christianity, and Islam'],
                ['name'=>'Philippine Folk Religion','quarter'=>4,'description'=>'Syncretism and folk Catholicism'],
            ]],
            ['name'=>'Disciplines & Ideas in Social Sciences','code'=>'DISS','icon'=>'🧠','color'=>'#ec4899','grade_level'=>12,'track'=>'HUMSS','topics'=>[
                ['name'=>'Introduction to Social Science','quarter'=>1,'description'=>'Nature, scope, and methods of social sciences'],
                ['name'=>'Sociology & Anthropology','quarter'=>1,'description'=>'Social structures and sociological imagination'],
                ['name'=>'Political Science & Economics','quarter'=>2,'description'=>'Political systems and economic theories'],
                ['name'=>'Psychology & Human Behavior','quarter'=>2,'description'=>'Psychological perspectives and research'],
                ['name'=>'Social Issues & Research','quarter'=>3,'description'=>'Current social problems and solutions'],
            ]],

            // TVL STRAND
            ['name'=>'Information & Communications Technology','code'=>'ICT','icon'=>'💻','color'=>'#0284c7','grade_level'=>null,'track'=>'TVL','topics'=>[
                ['name'=>'Computer Hardware & Troubleshooting','quarter'=>1,'description'=>'Components, assembly, and maintenance'],
                ['name'=>'Operating Systems & Software','quarter'=>1,'description'=>'Windows, Linux basics, and software management'],
                ['name'=>'Networking Fundamentals','quarter'=>2,'description'=>'LAN/WAN, IP addressing, and routers'],
                ['name'=>'Web Development – HTML & CSS','quarter'=>2,'description'=>'HTML5, CSS3, and responsive design'],
                ['name'=>'Web Development – JavaScript','quarter'=>3,'description'=>'DOM manipulation and basic scripting'],
                ['name'=>'Database Management','quarter'=>3,'description'=>'SQL, relational databases, and queries'],
                ['name'=>'Cybersecurity Basics','quarter'=>4,'description'=>'Threats, malware, and safe online practices'],
                ['name'=>'Digital Media & Multimedia','quarter'=>4,'description'=>'Image editing, video production'],
            ]],
            ['name'=>'Cookery (Home Economics)','code'=>'COOKERY','icon'=>'🍳','color'=>'#ea580c','grade_level'=>null,'track'=>'TVL','topics'=>[
                ['name'=>'Kitchen Safety & Sanitation','quarter'=>1,'description'=>'Food safety, HACCP, and kitchen hygiene'],
                ['name'=>'Knife Skills & Cooking Methods','quarter'=>1,'description'=>'Knife cuts and moist/dry heat methods'],
                ['name'=>'Stocks, Soups & Sauces','quarter'=>2,'description'=>'Mother sauces and stock preparation'],
                ['name'=>'Meat, Poultry & Seafood','quarter'=>2,'description'=>'Fabrication and cooking to correct doneness'],
                ['name'=>'Baking & Pastry Fundamentals','quarter'=>3,'description'=>'Breads, cakes, cookies, and pastry science'],
                ['name'=>'Plating & Presentation','quarter'=>3,'description'=>'Garnishing and plating techniques'],
                ['name'=>'Costing & Menu Planning','quarter'=>4,'description'=>'Recipe costing and menu engineering'],
            ]],
            ['name'=>'Automotive Servicing','code'=>'AUTO','icon'=>'🔧','color'=>'#64748b','grade_level'=>null,'track'=>'TVL','topics'=>[
                ['name'=>'Automotive Safety & Tools','quarter'=>1,'description'=>'Shop safety, PPE, and hand tools'],
                ['name'=>'Engine Systems & Components','quarter'=>1,'description'=>'4-stroke cycle and engine parts'],
                ['name'=>'Fuel & Cooling Systems','quarter'=>2,'description'=>'Fuel injection, thermostat, and radiator'],
                ['name'=>'Electrical & Ignition Systems','quarter'=>2,'description'=>'Battery, alternator, and starter'],
                ['name'=>'Brake & Suspension Systems','quarter'=>3,'description'=>'Drum/disc brakes and suspension geometry'],
                ['name'=>'Diagnostics & Troubleshooting','quarter'=>4,'description'=>'Diagnostic tools and repair procedures'],
            ]],
        ];

        $this->command->info('Seeding ' . count($subjects) . ' subjects...');

        foreach ($subjects as $subjectData) {
            $topics = $subjectData['topics'];
            unset($subjectData['topics']);
            $subjectData['created_at'] = $now;
            $subjectData['updated_at'] = $now;

            $subjectId = DB::table('subjects')->insertGetId($subjectData);

            $topicInserts = [];
            foreach ($topics as $i => $topic) {
                $topicInserts[] = [
                    'subject_id'  => $subjectId,
                    'name'        => $topic['name'],
                    'description' => $topic['description'] ?? null,
                    'quarter'     => $topic['quarter'],
                    'sort_order'  => $i + 1,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];
            }
            DB::table('topics')->insert($topicInserts);
        }

        $totalTopics = DB::table('topics')->count();
        $this->command->info("✅ Seeded " . DB::table('subjects')->count() . " subjects and {$totalTopics} topics.");
    }
}
