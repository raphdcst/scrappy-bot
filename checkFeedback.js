function calculateOverallRating(pos, neg, totalSold) {
    const totalReviews = pos + neg;

    if (totalReviews === 0) {
        throw new Error("Le nombre total d'avis ne peut pas être zéro.");
    }

    // Calcul du score de satisfaction basé sur le ratio d'avis positifs
    const positiveRatio = pos / totalReviews;
    let satisfactionScore = positiveRatio * 100;

    // Ajustement du score en fonction du ratio d'avis positifs par rapport aux avis négatifs
    const positiveToNegativeRatio = pos / (neg + 1); // Ajout de 1 pour éviter la division par zéro
    satisfactionScore *= Math.log(positiveToNegativeRatio + 1); // Utilisation du logarithme pour accentuer les différences

    // Détermination de l'avis en fonction du score de satisfaction
    if (satisfactionScore < 40) {
        return "Avis très défavorable";
    } else if (satisfactionScore < 60) {
        return "Avis défavorable";
    } else if (satisfactionScore < 80) {
        return "Avis neutre";
    } else {
        return "Avis favorable";
    }
}

// Simulation de 10 ensembles de valeurs aléatoires
// function simulateOverallRating() {
//     for (let i = 0; i < 10; i++) {
//         // Générer des valeurs aléatoires pour les avis positifs et négatifs
//         const pos = Math.floor(Math.random() * 11); // Valeurs entre 0 et 10
//         const neg = Math.floor(Math.random() * 11); // Valeurs entre 0 et 10

//         // Générer un nombre aléatoire pour les ventes réalisées
//         const totalSold = Math.floor(Math.random() * 11) + Math.max(pos + neg, 1); // Valeurs entre nombre d'avis total et 1,25 fois supérieur

//         // Calculer et afficher l'avis pour cet ensemble de valeurs
//         const overallRating = calculateOverallRating(pos, neg, totalSold);
//         console.log(`Avis pour l'ensemble ${pos} positifs / ${neg} négatifs et ${totalSold}: ${overallRating}`);
//     }
// }

// Appel de la simulation
console.log(calculateOverallRating(20, 15, 40))




