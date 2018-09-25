var numDice = 3;
var diceMin = 1;
var diceMax = 6;

//This will hold the odds for individual rolls of 3d6
var odds = computeOdds(numDice, diceMin, diceMax);
//This will hold the total odds
var oddSum = odds.reduce(add,null);
//This will hold the max of all odds
var oddMax = odds.reduce(Math.max,null);
//This will hold the min of all odds
var oddMin = odds.reduce(Math.min,null);

//Bonus element
var bonusElement;
//Min bonus
var minBonus;
//Max bonus
var maxBonus;

//Buckets and their labels
//1,2,3-4,5-6,7-8,9-10,11-12,13-15,16-19,20,21
var bucketsNarrow = [
	{min:1 , max:1 , name:'Undershoot' },
	{min:2 , max:2 , name:'Vital Failure' },
	{min:3 , max:5 , name:'Critical Failure' },
	{min:6 , max:8 , name:'Consequential Failure' },
	{min:9 , max:10 , name:'Safe Failure' },
	{min:11 , max:12 , name:'Simple Success' },
	{min:13 , max:15 , name:'Great Success' },
	{min:16 , max:19 , name:'Critical Success' },
	{min:20 , max:20 , name:'Overshoot' },
	{min:21 , max:21 , name:'Hypershoot' }
];
var bucketsBroad = [
	{min:1 , max:10 , name:'Failure' },
	{min:11 , max:21 , name:'Success' }
];
var bucketsAll = [...bucketsNarrow, ...bucketsBroad];

function add(a,b) {
	if(a==null && b==null)
		return 0;
	if(a==null)
		return b;
	if(b==null)
		return a;
	return a+b;
}

function computeOdds(dice, diceMin, diceMax) {
	var retVals = [];
	computeOddsInternal(dice, diceMin, diceMax, 0, retVals);
	return retVals;
}

function computeOddsInternal(dice, diceMin, diceMax, currentSum, retVals) {
	for(var i = diceMin; i <= diceMax; ++i) {
		var nextCurrentSum = currentSum + i;
		if(dice <= 1) {
			if(retVals[nextCurrentSum] == null) {
				retVals[nextCurrentSum] = 1;
			} else {
				retVals[nextCurrentSum] = retVals[nextCurrentSum] + 1;
			}
		}
		else {
			computeOddsInternal(dice-1, diceMin, diceMax, nextCurrentSum, retVals);
		}
	}
}

function setupTable() {
	//Bonus element
	bonusElement = document.getElementById('bonus');
	//Min bonus
	minBonus = Number(bonusElement.min);
	//Max bonus
	maxBonus = Number(bonusElement.max);
	
	fullTable('fullTableBroad',bucketsBroad);
	fullTable('fullTableNarrow',bucketsNarrow);
	updateProbs('probTableBroad',bucketsBroad);
	updateProbs('probTableNarrow',bucketsNarrow);
}

function fullTable(elementName,buckets) {
	var fullTable = document.getElementById(elementName);
	fullTable.innerHTML = '';
	
	//First create the title row
	var titleRow;
	var titleCol;
	
	titleRow = document.createElement('tr');
		titleCol = document.createElement('th');
			titleCol.innerHTML='Bucket Range';
			titleCol.rowSpan=2;
		titleRow.appendChild(titleCol);
		
		titleCol = document.createElement('th');
			titleCol.innerHTML='Bucket Name';
			titleCol.rowSpan=2;
		titleRow.appendChild(titleCol);
		
		titleCol = document.createElement('th');
			titleCol.innerHTML='Odds With Bonus';
			titleCol.colSpan=maxBonus - minBonus + 1;
		titleRow.appendChild(titleCol);	
	fullTable.appendChild(titleRow);
	
	titleRow = document.createElement('tr');
	for(var i = minBonus; i <= maxBonus; ++i) {
		titleCol = document.createElement('th');
			titleCol.innerHTML=i;
		titleRow.appendChild(titleCol);
	}
	fullTable.appendChild(titleRow);
	
	for(var i = 0; i < buckets.length; ++i) {
		var bucket = buckets[i];
		var bucketRow = document.createElement('tr');
			var bucketCol;
			
			bucketCol = document.createElement('th');
				if(bucket.min == bucket.max) {
					bucketCol.innerHTML = bucket.min;
				} else {
					bucketCol.innerHTML = bucket.min + " - " + bucket.max;
				}
			bucketRow.appendChild(bucketCol);
			
			bucketCol = document.createElement('th');
				bucketCol.innerHTML = bucket.name;
			bucketRow.appendChild(bucketCol);
			
			for(var bonus = minBonus; bonus <= maxBonus; ++bonus) {
				bucketCol = document.createElement('td');
					var sumWithBonus = 0;
					for(var k = bucket.min; k <= bucket.max; ++k) {
						sumWithBonus = add(sumWithBonus, odds[k-bonus]);
					}
					if(sumWithBonus == 0) {
						bucketCol.innerHTML = '-';
					} else {
						bucketCol.innerHTML = (sumWithBonus*100/oddSum).toFixed(2)+"%";
					}
				bucketRow.appendChild(bucketCol);
			}
		fullTable.appendChild(bucketRow);
	}
}

function updateProbs(elementName,buckets) {
	var bonus = Number(bonusElement.value);
	var minValue = numDice * diceMin + bonus;
	var maxValue = numDice * diceMax + bonus;
	
	var probTable = document.getElementById(elementName);
	probTable.innerHTML = '';
	
	//First create the title row
	var titleRow;
	var titleCol;
	
	titleRow = document.createElement('tr');
		titleCol = document.createElement('th');
			titleCol.innerHTML='Dice Result';
		titleRow.appendChild(titleCol);
		
		titleCol = document.createElement('th');
			titleCol.innerHTML='Bucket Name';
		titleRow.appendChild(titleCol);
		
		titleCol = document.createElement('th');
			titleCol.innerHTML='Odds';
		titleRow.appendChild(titleCol);	
	probTable.appendChild(titleRow);
	
	for(var i = 0; i < buckets.length; ++i) {
		var bucket = buckets[i];
		
		//Skip bucket if not in results
		if(bucket.max < minValue || bucket.min > maxValue)
			continue;
		
		var bucketStart = Math.max(minValue, bucket.min);
		var bucketEnd = Math.min(maxValue, bucket.max);
		var bucketLength = bucketEnd - bucketStart + 1;
		
		//Skip bucket if impossible to output
		if(bucketStart > bucketEnd)
			continue;
		
		var sumWithBonus = 0;
		for(var roll = bucketStart; roll <= bucketEnd; ++roll) {
			sumWithBonus = add(sumWithBonus, odds[roll-bonus]);
		}
		
		for(var roll = bucketStart; roll <= bucketEnd; ++roll) {
			var rollRow = document.createElement('tr');
				var rollCol;
				rollCol = document.createElement('th');
					rollCol.innerHTML = roll;
				rollRow.appendChild(rollCol);
				
				if(roll == bucketStart) {
					rollCol = document.createElement('th');
						rollCol.innerHTML = bucket.name;
						rollCol.rowSpan = bucketLength;
					rollRow.appendChild(rollCol);
					
					rollCol = document.createElement('td');
						rollCol.innerHTML = (sumWithBonus*100/oddSum).toFixed(2)+"%";
						rollCol.rowSpan = bucketLength;
					rollRow.appendChild(rollCol);
				}
			probTable.appendChild(rollRow);
		}
	}
}