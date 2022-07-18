const POSITIONS = [
    "P", "C", "1B", "2B", "3B", "SS", "LF", "LCF", "RCF", "RF",
];

const NUM_INNINGS = 8;

const NUM_MALE_FIELDERS = 7;
const NUM_NONMALE_FIELDERS = 3;

class Team {
    constructor() {
        this.males = [];
        this.nonmales = [];
    }

    addPlayer(player) {
        const randomPositions = [...POSITIONS].sort(() => Math.random() - 0.5);

        if (player.positions === undefined) {
            player.positions = [];
        }

        for (let position in player.positions) {
            player.positions[position] = player.positions[position].toUpperCase();
        }

        for (let position of randomPositions) {
            if (!player.positions.includes(position)) {
                player.positions.push(position);
            }
        }

        if (player.male) {
            this.males.push(player);
        }
        else {
            this.nonmales.push(player);
        }
    }

    battingOrder() {
        const order = [];
        for (let m = 0, nm = 0; m < 200; m += 3, nm++) {
            order.push(this.males[m % this.males.length]);
            order.push(this.males[(m + 1) % this.males.length]);
            order.push(this.males[(m + 2) % this.males.length]);
            order.push(this.nonmales[nm % this.nonmales.length]);
        }
        return order;
    }

    positions() {
        let numMalesBenched = this.males.length - NUM_MALE_FIELDERS;
        let numNonmalesBenched = this.nonmales.length - NUM_NONMALE_FIELDERS;

        let numMalesPlaying = NUM_MALE_FIELDERS;
        let numNonmalesPlaying = NUM_NONMALE_FIELDERS;

        if (numMalesBenched < 0) {
            numMalesBenched = 0;
            numMalesPlaying = this.males.length;
        }

        if (numNonmalesBenched < 0) {
            numNonmalesBenched = 0;
            numNonmalesPlaying = this.nonmales.length;
        }

        const innings = [];
        for (let inning = 0; inning < NUM_INNINGS; inning++) {
            const pos = {};

            const mStart = (inning * numMalesBenched) % this.males.length;
            const mEnd = mStart + numMalesPlaying;
            const males = this.males.concat(this.males).slice(mStart, mEnd);
            const malesBenched = this.males.filter(x => males.indexOf(x) < 0);

            const nmStart = (inning * numNonmalesBenched) % this.nonmales.length;
            const nmEnd = nmStart + numNonmalesPlaying;
            const nonmales = this.nonmales.concat(this.nonmales).slice(nmStart, nmEnd);
            const nonmalesBenched = this.nonmales.filter(x => nonmales.indexOf(x) < 0);

            const availablePositions = new Set(POSITIONS);

            nonmales.sort(() => Math.random() - 0.5);
            males.sort(() => Math.random() - 0.5);

            for (let nm of nonmales) {
                for (let choice of nm.positions) {
                    if (availablePositions.has(choice)) {
                        pos[choice] = nm;
                        availablePositions.delete(choice);
                        break;
                    }
                }
            }

            for (let m of males) {
                for (let choice of m.positions) {
                    if (availablePositions.has(choice)) {
                        pos[choice] = m;
                        availablePositions.delete(choice);
                        break;
                    }
                }
            }

            pos.benched = malesBenched.concat(nonmalesBenched);

            innings.push(pos);
        }

        return innings;
    }
}

const ros = [
    {name: "m1", male: true, positions: ["p"]},
    {name: "m2", male: true, positions: ["ss", "3b", "1b", "c", "2b", "LCF", "LF", "RCF", "RF"]},
    {name: "m3", male: true},
    {name: "m4", male: true},
    {name: "m5", male: true},
    {name: "m6", male: true},
    {name: "m7", male: true},
    {name: "m8", male: true},
    {name: "m9", male: true},
    {name: "f1", male: false},
    {name: "f2", male: false},
    {name: "f3", male: false},
    {name: "f4", male: false},
];

const myTeam = new Team();
// for (let r of ros) {
//     myTeam.addPlayer(r);
// }

window.onbeforeunload = function () {
    return "";
};

document.getElementById("add-player").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("player-name").value;
    let positions = document.getElementById("player-positions").value.split(" ");
    const male = document.getElementById("player-male").checked;
    if (!name) {
        return;
    }
    positions = positions.filter(x => x.length > 0);
    myTeam.addPlayer({name, positions, male});
    const rosterLi = document.createElement("li");
    rosterLi.textContent = name;
    const rosterUl = document.getElementById("roster");
    rosterUl.appendChild(rosterLi);

    document.getElementById("player-name").value = "";
    document.getElementById("player-positions").value = "";
    document.getElementById("player-male").checked = false;
});

document.getElementById("start-game").addEventListener("click", () => {
    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "block";
    const battingOrder = myTeam.battingOrder();
    const positions = myTeam.positions();

    const generateFieldingTable = (inning) => {
        const fieldingTable = document.getElementById("fielding-table");
        fieldingTable.innerHTML = "";

        const row = document.createElement("tr");
        const positionCell = document.createElement("td");
        positionCell.textContent = "Benched";
        const nameCell = document.createElement("td");
        nameCell.textContent = positions[inning].benched.map(x => x.name).join(", ");
        nameCell.className = "wide";
        row.appendChild(positionCell);
        row.appendChild(nameCell);
        fieldingTable.appendChild(row);

        for (let position of POSITIONS) {
            const row = document.createElement("tr");
            const positionCell = document.createElement("td");
            positionCell.textContent = position;
            const nameCell = document.createElement("td");
            nameCell.textContent = positions[inning][position]?.name;
            nameCell.className = "wide";
            row.appendChild(positionCell);
            row.appendChild(nameCell);
            fieldingTable.appendChild(row);
        };
    };

    const lineup = document.getElementById("lineup");
    for (let batter of battingOrder) {
        const li = document.createElement("li");
        li.textContent = batter.name;
        li.addEventListener("click", (e) => {
            for (let child of lineup.childNodes) {
                child.style.backgroundColor = "white";
            }
            e.target.style.backgroundColor = "lightyellow";
        });
        lineup.appendChild(li);
    }

    for (let i = 0; i < NUM_INNINGS; i++) {
        const fieldingNav = document.getElementById("fielding-nav");
        const button = document.createElement("button");
        button.textContent = i + 1;
        button.addEventListener("click", () => {
            generateFieldingTable(i);
        });
        fieldingNav.appendChild(button);
    }
});

document.getElementById("show-lineup").addEventListener("click", () => {
    document.getElementById("batting").style.display = "block";
    document.getElementById("fielding").style.display = "none";
});

document.getElementById("show-fielding").addEventListener("click", () => {
    document.getElementById("fielding").style.display = "block";
    document.getElementById("batting").style.display = "none";
});
