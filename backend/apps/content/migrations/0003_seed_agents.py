import csv
import io

from django.db import migrations


AGENT_DATA = r'''aprilsturko@gmail.com,April Sturko,7802364764,Century  21 Masters,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
george@mozaicrealty.ca,George Fahmy,780-555-1234,Mozaic Realty Group,SuperAdmin,Broker,Active,Licensed  Realtor®,Edmonton (AB),null,null
rishabsachdeva50@gmail.com,Rishab Sachdeva,778-513-0018,Initia Real Estate,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
mina@minagayed.ca,Mina Gayed,780-994-6462,No Company (Independent),Agent,Broker,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
david.wan@mattamycorp.com,David Wan,null,Mattamy Homes,Builder/Client,Builder / Developer,Active,Vice President - Sales,Edmonton (AB),N/A,null
haijunyan@gmail.com,Haijun Yan,780-937-9648,Mozaic Realty Group,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),null,null
lokesh@hotmail.ca,Lokesh Sharma,780-271-9100,Royal LePage Summit Reakty,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
scottysold@gmail.com,Scott MacMillan,7809708489,The MacMillan Team,Agent,Agent,Active,Licensed  Realtor®,null,N/A,null
nia@mozaicrealty.ca,Nia Pavesi,780-263-4291,Mozaic Realty Group,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),null,null
mcatindigrealty@gmail.com,Mary Catindig,780-908-8174,Maxwell Challenge Realty,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
ravigo@shaw.ca,Ravi Govindasamy,780-710-3575,Century 21 Quantum Realty,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
sdevji.maxwell@gmail.com,Shafin Devji,780-953-7861,MaxWell Polaris,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
qingbin.li@gmail.com,Qingbin (Leo) Li,780-937-6536,Mozaic Realty Group,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
marketing@mozaicrealty.ca,MOZAIC MARKETING,780-905-3008,Mozaic Realty Group,Agent,Agent,Active,Marketing Manager,"Edmonton, AB",null,null
raminderbal.realestate@gmail.com,Raminder Bal,587-982-2766,EXP Realty,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
savan@thehomess.com,Savan Solanki,519-992-7939,RE/MAX Complete Realty,Agent,Agent,Active,Licensed  Realtor®,Calgary (AB),N/A,null
naveen@naveenmonga.ca,Naveen Monga,780-777-2608,MaxWell Polaris,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
homes.zaharichuk@gmail.com,Dean Zaharichuk,780-264-8112,Maxwell Devonshire Realty,Agent,Agent,Active,Licensed  Realtor®,Sherwood Park (AB),N/A,null
realtor.azizsells@gmail.com,Aziz Dhamani,780-709-1979,Initia Real Estate,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),,null
abi@mozaicrealty.ca,Abi MacKenzie,825-886-1144,Mozaic Realty Group,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),null,null
ilezamarealty@gmail.com,Isaiah Lezama,5875962486,MaxWell Polaris,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
John@TheAcevedoTeam.ca,John Acevedo,587-987-3636,Royal LePage Noralta Real Estate,Agent,Agent,Active,Licensed  Realtor®,Spruce Grove (AB),N/A,null
june@rreg.ca,June Rorke,780-903-3383,RE/MAX Excellence,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
changshi67@gmail.com,Will Chang,780-616-8256,MaxWell Polaris,Agent,Agent,Active,Licensed  Realtor®,null,N/A,null
zeynabrealestates@gmail.com,Zeynab Akolade,587-936-0204,Sterling Real Estate,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
deolsells@gmail.com,Amrit Deol,587-988-3886,RE/MAX Excellence,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
bin@mozaicrealty.ca,Bin Chen,825-977-5151,Mozaic Realty Group,Agents,Agent,Active,Licensed  Realtor®,Edmonton (AB),null,null
patrisha.veronica@gmail.com,PJ,7800000000,null,Builder/Client,Buyer Client,Active,null,Edmonton,N/A,null
sultanizara@gmail.com,Zara Sultani,780-729-5337,MaxWell Polaris,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
rezan@mozaicrealty.ca,Rezan Bebany,587-938-6033,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
digital@mozaicrealty.ca,Kristen Chen,647-550-4912,Mozaic Realty Group,Agents,Agent,Active,Digital Marketing,Edmonton (AB),null,null
eva@kubiczekteam.com,Eva Wolicki,780-982-7269,Keystone Realty,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
harmangill@hsgelitehomes.com,Harman Singh Gill,587-938-2611,EXP Realty,Agent,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
michelle.moores@mattamycorp.com,Michelle Moores,null,Mattamy Homes,Builder/Client,Builder / Developer,Active,Online Sales Manager,Edmonton (AB),N/A,null
jian.chang@mattamycorp.com,Jian Chang,null,Mattamy Homes,Builder/Client,Builder / Developer,Active,"Senior Manager, Data Analytics",Edmonton (AB),N/A,null
manny@mozaicrealty.ca,Manny Dhami,780-935-0168,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
christopher.field@mattamycorp.com,Chris Field,null,Mattamy Homes,Builder/Client,Builder / Developer,Active,Vice President - Finance,Edmonton (AB),N/A,null
rasan.bhinder@gmail.com,Rasan Bhinder,780-239-7877,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
congkiko@cantiro.ca,Chris Ongkiko,null,Cantiro Homes,Builder/Client,Builder / Developer,Active,Sales Manager,Edmonton (AB),N/A,null
jacinta@mozaicrealty.ca,Jacinta Okorie,(780) 298-4405,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
edmontonfanyang@gmail.com,Fan Yang,780-885-7077,Mozaic Realty Group,Agent,Agent,Active,Licensed  Realtor®,Edmonton,N/A,null
dare@mozaicrealty.ca,Dare Odekunle,(403) 819-1267,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
sarahanne@mozaicrealty.ca,Sarah Anne Trink,780-904-7895,Mozaic Realty Group,SuperAdmin,Agent,Active,Team Admin,Edmonton (AB),N/A,null
shawn@mozaicrealty.ca,Shawn Chaudhry,780-616-3609,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
harsimran@mozaicrealty.ca,Harsimran Bains,3063163609,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,Edmonton (AB),N/A,null
vidaguan33@gmail.com,Tingfang (Vida) Guan,(780) 885-2676,Mozaic Realty Group,Agent,Agent,Active,Licensed Realtor®,https://radarre.tech/,N/A,null
niteshpadwal88@yahoo.com,Nitesh Padwal,780-710-0195,Initia real estate,Agent,Agent,Active,Licensed Realtor®,Edmonton,N/A,null
patrisha@mozaicrealty.ca,Maria Patrisha Joson,7802926125,Mozaic Realty Group,SuperAdmin,Agent,Active,Licensed  Realtor®,Edmonton (AB),N/A,null
kunaalgupta@hotmail.com,Kunaal Gupta,5879362419,Mozaic Realty Group,SuperAdmin,Agent,Active,Licensed Realtor ®,"Edmonton, AB",null,null
kunaal@mozaicrealty.ca,Kunaal Gupta,5879362419,Independent,Agent,Agent,Active,null,null,N/A,null'''


def normalize(value):
    value = value.strip()
    return "" if value.lower() in {"null", "n/a"} else value


def seed_agents(apps, schema_editor):
    Agent = apps.get_model("content", "Agent")
    fields = (
        "email", "full_name", "phone_number", "company", "access_role",
        "professional_role", "status", "job_title", "location",
        "license_number", "license_expiry",
    )

    for row in csv.reader(io.StringIO(AGENT_DATA)):
        values = dict(zip(fields, (normalize(value) for value in row)))
        email = values.pop("email")
        values["license_expiry"] = values["license_expiry"] or None
        Agent.objects.update_or_create(
            email=email,
            defaults={"userid": email.lower(), **values},
        )


def remove_seeded_agents(apps, schema_editor):
    Agent = apps.get_model("content", "Agent")
    emails = [row[0] for row in csv.reader(io.StringIO(AGENT_DATA))]
    Agent.objects.filter(email__in=emails).delete()


class Migration(migrations.Migration):
    dependencies = [("content", "0002_agent")]

    operations = [migrations.RunPython(seed_agents, remove_seeded_agents)]
