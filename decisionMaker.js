class DecisionMaker {
    constructor(type, team, entities){
        this.type = type;
        this.team = team;
        this.entities = entities;
    }
    updateEntities(entities){
        this.entities = entities;
    }
}

class RandomDecisionMaker extends DecisionMaker {
    constructor(team, entities){
        super('RANDOM', team, entities);
    }
    decide(human){
        let decisions = human.get_decisions();
        if(!decisions || decisions.length === 0) return;

        let decision_index = getRandomInt(0, decisions.length);
        let decision = decisions[decision_index];
        let decision_name = decision[0];
        let decision_spot = decision[1] ? decision[1][getRandomInt(0, decision[1].length)] : undefined;
        human.execute(decision_name, decision_spot);
    }
    makeDecisions(){
        let arr = this.team === 'Team2' ? this.entities.humans2 : this.entities.humans1;
        for(let human of arr){
            this.decide(human);
        }
    }
}

class CPUDecisionMaker extends DecisionMaker {
    constructor(team, entities){
        super('CPU', team, entities);
    }
    decide(human){
        let decisions = human.get_decisions();
        if(!decisions || decisions.length === 0) return;
        // to be implemented...
    }
    makeDecisions(){
        let arr;
        switch (this.team){
            case 'Team1':
                arr = this.entities.humans1;
                break;
            case 'Team2':
                arr = this.entities.humans2;
                break;
        }
        for(let human of arr){
            this.decide(human);
        }
    }
}

/*
TODO:

Human decision should interact with this.entities!
- collect Apples, should properly remove apple entity from this.entities
- when Tree gets destroyed, it should update wood in this.entities
- collect Wood, should properly remove wood entity from this.entities
*/