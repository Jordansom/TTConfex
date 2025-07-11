file = open("package.json","r+").readlines()
dic = dict()
for line in file:
    values = line.strip().split(":")
    print(values)
    if(len(values)==2):
        dic[values[0]] = values[1]
    else:
        dic[values[0]] = values[0]
for i in dic.keys():
    if(i == "\"version\""):
        numbers = dic[i].split(".")
        print(numbers)
    else:
        print(i, dic[i])